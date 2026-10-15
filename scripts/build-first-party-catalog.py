"""Merge checked-in, copyable first-party examples and tools into the verified catalog."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
source=root/'data'/'resources.json'
existing=json.loads(source.read_text())
base=[x for x in existing if not x.get('firstParty')]
specs=json.loads((root/'data'/'first-party-specs.json').read_text())
if len(specs)!=42 or len({s['slug'] for s in specs})!=42: raise ValueError('Expected 42 unique first-party specs')
for plan in specs:
 slug,name,kind=plan['slug'],plan['name'],plan['type']
 repo='https://github.com/GraphicMiles/Motionshelf'
 if kind=='ui':
  for extension in ('html','css','js','zip'):
   if not (root/'public'/'examples'/f'{slug}.{extension}').is_file(): raise ValueError(f'Missing UI example {slug}.{extension}')
  source_url=f'{repo}/blob/main/public/examples/{slug}.js'
  install=f'Download /examples/{slug}.zip and open {slug}.html; no package install is required.'
  usage=f'Use the HTML, CSS, and JavaScript in the ZIP together. The live preview runs those same files. {plan["scope"]}'
  frameworks=['JavaScript'];runtime='Browser';preview=slug
 else:
  for source_file in (root/'agents'/f'{slug}.mjs',root/'public'/'agents'/f'{slug}.zip'):
   if not source_file.is_file(): raise ValueError(f'Missing agent tool {source_file}')
  source_url=f'{repo}/blob/main/agents/{slug}.mjs'
  install='git clone https://github.com/GraphicMiles/Motionshelf.git'
  usage=f'From the cloned repository run node agents/{slug}.mjs --help, or download /agents/{slug}.zip, extract it, and run node {slug}.mjs sample.json. Requires Node.js 20+. {plan["scope"]}'
  frameworks=['Node.js'];runtime='Node.js 20+';preview=None
 base.append({'slug':slug,'name':name,'type':kind,'category':plan['category'],'description':plan['description'].replace('A proposed local scanner','A local scanner').replace('A proposed ','An offline '),'tags':plan['tags'],'frameworks':frameworks,'runtime':runtime,'repository':repo,'source':source_url,'website':repo,'license':'MIT','attribution':'MotionShelf first-party example. Retain the project MIT license and copyright notice.','install':install,'usage':usage,'version':'See repository history','maintenance':'First-party maintained','preview':preview,'verified':{'repository':True,'license':True},'firstParty':True})
source.write_text(json.dumps(base,ensure_ascii=False,indent=2)+'\n')
print(f'Catalog contains {len(base)} working resources, including {len(specs)} first-party builds')
