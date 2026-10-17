from typing import Protocol
from pathlib import Path
from pydantic import BaseModel, Field


class Segment(BaseModel):
    segment_id: str
    start_ms: int = Field(ge=0)
    end_ms: int = Field(gt=0)
    text: str


class Transcript(BaseModel):
    engine: str
    model: str
    duration_ms: int
    segments: list[Segment]


class Transcriber(Protocol):
    def transcribe(self, local_media: Path) -> Transcript: ...

# Interface only. No ASR dependency, model download, media upload route or CUDA initialization.
