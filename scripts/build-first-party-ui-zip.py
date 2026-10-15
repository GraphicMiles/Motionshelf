"""Package each live HTML/CSS/JS preview unchanged into a reusable ZIP."""
import json
import zipfile
from pathlib import Path
root=Path(__file__).resolve().parent.parent
folder=root/'public'/'examples'
plans=json.loads((root/'data'/'first-party-specs.json').read_text())
for plan in (p for p in plans if p['type']=='ui'):
 slug=plan['slug']
 files={f'{slug}.{ext}':(folder/f'{slug}.{ext}').read_bytes() for ext in ('html','css','js')}
 files['README.md']=(f"# {plan['name']}\n\nFirst-party MotionShelf UI example. Open `{slug}.html` in a browser or serve it from a local static server. Its script and stylesheet are the exact files used by the live preview. No dependencies, network requests, or build steps are needed.\n\nTarget interaction: {plan['scope']}\n\nThe example is licensed under the MotionShelf MIT license. Keep the included license notice when redistributing.\n").encode()
 files['LICENSE']=(root/'LICENSE').read_bytes()
 with zipfile.ZipFile(folder/f'{slug}.zip','w') as archive:
  for name,contents in files.items():
   item=zipfile.ZipInfo(name,date_time=(2025,1,1,0,0,0));item.compress_type=zipfile.ZIP_DEFLATED;item.external_attr=0o644<<16;archive.writestr(item,contents)
print('Packaged',len([p for p in plans if p['type']=='ui']),'UI examples')
