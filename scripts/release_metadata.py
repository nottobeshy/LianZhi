"""Build identity and third-party license inventory; no application data is read."""
import hashlib
from importlib import metadata
import json
from pathlib import Path
import shutil
import subprocess
import sys
from backend.version import VERSION


def git(*args):
    root=Path(__file__).resolve().parent.parent
    return subprocess.check_output(['git','-c','safe.directory='+root.as_posix(),*args],cwd=root,text=True,encoding='utf-8').strip()


def main():
    target=Path('build/release-metadata');target.mkdir(parents=True,exist_ok=True)
    if git('diff','HEAD','--name-only'):
        raise SystemExit('Commit source changes before building; source/EXE identity must be reviewable.')
    info=dict(version=VERSION,commit=git('rev-parse','HEAD'),candidate=True,python=sys.version.split()[0],platform='Windows-x64')
    (target/'build-info.json').write_text(json.dumps(info,indent=2),encoding='utf-8')
    version_tuple=tuple(map(int,VERSION.split('.')))+(0,)
    (target/'version-info.txt').write_text(f'''VSVersionInfo(
  ffi=FixedFileInfo(filevers={version_tuple!r},prodvers={version_tuple!r},mask=0x3f,flags=0,OS=0x40004,fileType=1,subtype=0,date=(0,0)),
  kids=[StringFileInfo([StringTable('040904B0',[
    StringStruct('FileDescription','LianZhi'),StringStruct('FileVersion','{VERSION}'),
    StringStruct('ProductName','LianZhi'),StringStruct('ProductVersion','{VERSION}')])]),
    VarFileInfo([VarStruct('Translation',[1033,1200])])])
''',encoding='utf-8')
    licenses=target/'third-party-licenses';licenses.mkdir(exist_ok=True)
    inventory=[]
    for dist in sorted(metadata.distributions(),key=lambda d:d.metadata['Name'].lower()):
        name=dist.metadata['Name'];files=[]
        for entry in dist.files or []:
            # Include upstream notices verbatim, including native-wheel notices where shipped.
            if any(part.lower() in ('licenses','license','copying','notice') for part in entry.parts) or entry.name.lower().startswith(('license','copying','notice','authors')):
                source=Path(dist.locate_file(entry))
                if source.is_file():
                    dest=licenses/name/Path(*[p for p in entry.parts if p not in ('..','.')])
                    dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,dest);files.append(str(dest.relative_to(target)).replace('\\','/'))
        inventory.append(dict(name=name,version=dist.version,license=dist.metadata.get('License-Expression') or dist.metadata.get('License'),files=files))
    (target/'dependency-inventory.json').write_text(json.dumps(inventory,ensure_ascii=False,indent=2),encoding='utf-8')
    # Python's own license lives outside its wheel distributions.
    python_license=Path(sys.base_prefix)/'LICENSE.txt'
    if python_license.is_file():shutil.copyfile(python_license,licenses/'Python-LICENSE.txt')
    print(json.dumps(info))


if __name__=='__main__':main()
