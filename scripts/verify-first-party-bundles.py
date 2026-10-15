"""Check all downloadable first-party bundles contain the exact shipped source."""
import json
import zipfile
from pathlib import Path
root=Path(__file__).resolve().parent.parent
specs=json.loads((root/'data'/'first-party-specs.json').read_text())
for item in specs:
 slug=item['slug']
 if item['type']=='ui':
  folder=root/'public'/'examples'
  with zipfile.ZipFile(folder/f'{slug}.zip') as z:
   for extension in ('html','css','js'):
    name=f'{slug}.{extension}'
    assert z.read(name)==(folder/name).read_bytes(),name
   assert z.read('LICENSE')==(root/'LICENSE').read_bytes()
 else:
  folder=root/'agents'
  with zipfile.ZipFile(root/'public'/'agents'/f'{slug}.zip') as z:
   for name in (f'{slug}.mjs','core.mjs','run.mjs'):
    assert z.read(name)==(folder/name).read_bytes(),name
   assert json.loads(z.read('sample.json'))
   assert z.read('LICENSE')==(root/'LICENSE').read_bytes()
print(f'Verified {len(specs)} first-party bundles against their running source')
