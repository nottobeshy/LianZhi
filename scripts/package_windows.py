"""Package only the onedir output; never package the project directory."""
import hashlib
import json
from pathlib import Path
import zipfile
import pefile
import subprocess


def main():
    app=Path('dist/LianZhi');info=json.loads((app/'build-info.json').read_text(encoding='utf-8'))
    files=sorted(p for p in app.rglob('*') if p.is_file())
    forbidden={'.db','.sqlite','.sqlite3','.mp4','.mov','.wav','.webm','.key','.log'}
    for file in files:
        assert not file.is_symlink(), 'Do not package symlinks'
        assert file.suffix.lower() not in forbidden and file.name not in ('.env','llm-settings.json','app.lock','model.bin'), file.name
    assert (app/'LianZhi.exe').is_file() and (app/'LianZhi-worker.exe').is_file()
    for filename,subsystem in [('LianZhi.exe',2),('LianZhi-worker.exe',3)]:
        with pefile.PE(str(app/filename)) as pe:
            assert pe.FILE_HEADER.Machine==0x8664 and pe.OPTIONAL_HEADER.Subsystem==subsystem
            assert pe.VS_FIXEDFILEINFO[0].FileVersionMS==1, 'Expected v0.1.x file resource'
    output=Path('release-artifacts');output.mkdir(exist_ok=True)
    archive=output/f"LianZhi-v{info['version']}-windows-x64-candidate.zip"
    with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for file in files:z.write(file,'LianZhi/'+file.relative_to(app).as_posix())
    with archive.open('rb') as f:digest=hashlib.file_digest(f,'sha256').hexdigest()
    archive.with_suffix('.zip.sha256').write_text(digest+'  '+archive.name+'\n',encoding='ascii')
    source=output/f"LianZhi-v{info['version']}-source.zip"
    root=Path.cwd()
    subprocess.run(['git','-c','safe.directory='+root.as_posix(),'archive','--format=zip','--prefix=LianZhi-source/',
                    '--output='+str(source.resolve()),info['commit']],check=True)
    with zipfile.ZipFile(source,'a',zipfile.ZIP_DEFLATED) as z:
        for entry in z.infolist():
            p=Path(entry.filename)
            assert p.suffix.lower() not in forbidden and p.name not in ('.env','llm-settings.json','model.bin'), 'Private artifact found in source archive'
        z.writestr('LianZhi-source/SOURCE_VERSION.json',json.dumps(info,indent=2))
    with source.open('rb') as f:source_digest=hashlib.file_digest(f,'sha256').hexdigest()
    source.with_suffix('.zip.sha256').write_text(source_digest+'  '+source.name+'\n',encoding='ascii')
    manifest=dict(**info,zip=archive.name,sha256=digest,bytes=archive.stat().st_size,files=len(files),
                  source_zip=source.name,source_sha256=source_digest,gui_acceptance='pending')
    (output/'candidate-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print(json.dumps(manifest))


if __name__=='__main__':main()
