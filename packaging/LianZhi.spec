# Build from the repository root with scripts/build_windows.ps1.
from pathlib import Path
from PyInstaller.utils.hooks import collect_data_files, copy_metadata

root = Path(SPECPATH).parent
datas = [(str(root/'demo/index.html'),'demo'), (str(root/'demo/css'),'demo/css'),
         (str(root/'demo/js'),'demo/js'), (str(root/'backend/data'),'backend/data'),
         (str(root/'build/release-metadata/build-info.json'),'.')]
# faster-whisper needs its VAD ONNX file and reads distribution metadata at runtime.
datas += collect_data_files('faster_whisper', includes=['assets/*'])
for package in ['faster-whisper','av','ctranslate2','pywebview','platformdirs']:
    datas += copy_metadata(package)
a = Analysis([str(root/'desktop_entry.py')], pathex=[str(root)], datas=datas,
    binaries=[], hiddenimports=['webview.platforms.edgechromium','webview.platforms.winforms',
        'uvicorn.logging','uvicorn.loops.asyncio','uvicorn.protocols.http.h11_impl',
        'uvicorn.lifespan.on','faster_whisper','backend.asr_worker'],
    hookspath=[str(root/'packaging/hooks')], runtime_hooks=[],
    excludes=['pytest','tkinter','PyQt5','PyQt6','PySide2','PySide6','cefpython3','IPython','matplotlib'], noarchive=False)
pyz = PYZ(a.pure)
# Shared PYZ/dependencies; worker is console-enabled for pipe output, launched CREATE_NO_WINDOW.
exe = EXE(pyz,a.scripts,[],exclude_binaries=True,name='LianZhi',console=False,debug=False,upx=False)
worker = EXE(pyz,a.scripts,[],exclude_binaries=True,name='LianZhi-worker',console=True,debug=False,upx=False)
coll = COLLECT(exe,worker,a.binaries,a.datas,strip=False,upx=False,name='LianZhi')
