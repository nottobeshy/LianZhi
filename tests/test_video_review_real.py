"""Opt-in real local ASR/browser; cloud review is explicitly mock, never charged here."""
import json
import os
import subprocess

import httpx
import pytest

from backend.config import ROOT
from tests.test_process import server


@pytest.mark.skipif(not (os.environ.get('LIANZHI_ASR_TEST_VIDEO') and os.environ.get('LIANZHI_BROWSER_TEST')=='1'),
                    reason='Opt-in local video/model and installed Playwright/Chromium required')
def test_actual_browser_asr_review_with_explicit_model_stub_and_restart(tmp_path):
    def browser(base, **extra):
        result=subprocess.run(['node',str(ROOT/'tests/browser-video-review.cjs')],cwd=ROOT,
            env={**os.environ,'TEST_BASE_URL':base,'TEST_EXPECT_MODE':'mock','TEST_STALE_SOURCE':'1',
                 'TEST_REVIEW_SCREENSHOT':str(tmp_path/'review.png'),**extra},
            capture_output=True,text=True,encoding='utf-8',timeout=240)
        assert result.returncode==0,result.stderr
        return json.loads(result.stdout.strip().splitlines()[-1])
    with server(tmp_path/'data') as base:
        evidence=browser(base)
        records=httpx.get(base+'/api/videos/'+evidence['id']+'/reviews',trust_env=False).json()
        assert len(records['items'])==1 and records['items'][0]['stale']
    with server(tmp_path/'data') as base:
        assert bool(httpx.get(base+'/api/videos/'+evidence['id']+'/reviews',trust_env=False).json()==records), 'Persisted review differs; private content omitted'
        evidence['restart']=browser(base,TEST_READ_ONLY='1',TEST_VIDEO_ID=evidence['id'])
    (tmp_path/'review-evidence.json').write_text(json.dumps(evidence,indent=2),encoding='utf-8')
    print('Real browser/ASR with explicit cloud Stub:',json.dumps(evidence))
