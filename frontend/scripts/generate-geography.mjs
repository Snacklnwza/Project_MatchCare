// Generate only the Thai location fields used by the forms.
// Source and license: src/data/geography.json and src/data/thailand-geography-json.LICENSE.txt.
import { readFileSync, writeFileSync } from 'node:fs'
const source = new URL('../src/data/geography.json', import.meta.url)
const output = new URL('../src/data/geography-options.json', import.meta.url)
const locations = {}
for (const row of JSON.parse(readFileSync(source, 'utf8'))) {
  const districts = locations[row.provinceNameTh] ??= {}
  const subdistricts = districts[row.districtNameTh] ??= []
  if (!subdistricts.includes(row.subdistrictNameTh)) subdistricts.push(row.subdistrictNameTh)
}
writeFileSync(output, JSON.stringify(locations) + '\n')
console.log(`Generated ${Object.keys(locations).length} provinces`)
