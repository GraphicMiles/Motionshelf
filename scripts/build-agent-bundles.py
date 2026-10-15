"""Build reproducible, self-contained downloadable first-party agent tool bundles."""
import json
import zipfile
from pathlib import Path

root=Path(__file__).resolve().parent.parent
agents=root/'agents'
target=root/'public'/'agents'
target.mkdir(parents=True,exist_ok=True)
samples={
 'repo-structure-map':{'files':[{'path':'src/index.js','content':'export const start = true'},{'path':'src/ui/button.js','content':'export function button(){}'},{'path':'README.md','content':'# Example'}]},
 'pr-change-risk':{'diff':'diff --git a/src/auth.js b/src/auth.js\n+++ b/src/auth.js\n+export const enabled = true\n-oldFlag()'},
 'test-gap-finder':{'changed':['src/button.js','src/menu.js'],'tests':['tests/button.test.js']},
 'dependency-impact-trace':{'entry':'src/state.js','files':[{'path':'src/state.js','content':'export const state = {}'},{'path':'src/app.js','content':'import {state} from "./state.js";'}]},
 'license-notice-check':{'files':[{'path':'LICENSE','content':'Example license text'},{'path':'package.json','content':'{"license":"MIT"}'}]},
 'docs-staleness-check':{'files':[{'path':'README.md','content':'[Setup](docs/setup.md) and [Gone](docs/old.md)'},{'path':'docs/setup.md','content':'# Setup'}]},
 'api-contract-diff':{'before':{'routes':{'/items':{'GET':{'required':[]},'POST':{'required':['name']}}}},'after':{'routes':{'/items':{'GET':{'required':['id']}}}}},
 'accessibility-review-assistant':{'html':'<main><img src="logo.png"><button><svg></svg></button><input></main>'},
 'release-checklist-builder':{'files':[{'path':'README.md','content':'Project overview'},{'path':'src/app.js','content':'export default true'}],'changed':['src/app.js']},
 'build-log-triage':{'log':'Build started\nError: module not found\nToken: sk-example-not-a-real-key\nFailed to compile'},
 'issue-duplicate-finder':{'query':{'title':'Search input loses focus'},'issues':[{'id':12,'title':'Search field loses focus on change'},{'id':15,'title':'Update footer copyright'}]},
 'prompt-boundary-probe':{'forbidden':['private marker'],'responses':[{'name':'safe','output':'No secrets here.'},{'name':'check','output':'private marker appeared'}]},
 'secret-pattern-audit':{'files':[{'path':'src/config.js','content':'const key = "ghp_123456789012345678901234567890123456";'}]},
 'localization-consistency-check':{'locales':{'en':{'welcome':'Hello {name}','close':'Close'},'fr':{'welcome':'Bonjour {name}'}}},
}
specs=json.loads((root/'data'/'first-party-specs.json').read_text())
expected={item['slug'] for item in specs if item['type']=='agent'}
if set(samples)!=expected: raise ValueError('Agent sample set must match first-party specs')
for slug,sample in samples.items():
 wrapper=agents/f'{slug}.mjs'
 wrapper.write_text(f"import {{execute}} from './run.mjs';\nawait execute('{slug}');\n")
 readme=f"# {slug.replace('-', ' ').title()}\n\nA first-party, offline MotionShelf agent tool. It reads the supplied JSON and produces a bounded, evidence-first report; it does not execute code, fetch remote content, or change repository files. Outputs are heuristics for human review, not verified conclusions.\n\n## Run\n\n```sh\nnode {slug}.mjs sample.json\n```\n\nRequires Node.js 20 or newer. See `sample.json` for the input structure. Keep the three `.mjs` files together. Input must be a JSON file under 1 MB.\n\nLicensed under the MotionShelf MIT license; retain the license notice in the repository.\n"
 bundle=target/f'{slug}.zip'
 with zipfile.ZipFile(bundle,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
  for name,contents in [(f'{slug}.mjs',wrapper.read_text()),('core.mjs',(agents/'core.mjs').read_text()),('run.mjs',(agents/'run.mjs').read_text()),('sample.json',json.dumps(sample,indent=2)+'\n'),('README.md',readme),('LICENSE',(root/'LICENSE').read_text())]:
   item=zipfile.ZipInfo(name,date_time=(2025,1,1,0,0,0));item.compress_type=zipfile.ZIP_DEFLATED;item.external_attr=0o644<<16;archive.writestr(item,contents)
print(f'Built {len(samples)} independent agent bundles')
