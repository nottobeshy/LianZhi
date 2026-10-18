from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field, StrictStr, StrictBool, SecretStr, StringConstraints, model_validator

Text = Annotated[StrictStr, StringConstraints(strip_whitespace=True, min_length=1)]
Id = Annotated[Text, Field(max_length=180, pattern=r'^[A-Za-z0-9_:\-]+$')]
RequestId = Annotated[Text, Field(max_length=80, pattern=r'^[A-Za-z0-9_\-]+$')]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra='forbid')


class Topic(StrictModel):
    id: Id
    vocab_id: Id
    title: Annotated[Text, Field(max_length=120)]
    domain: Annotated[Text, Field(max_length=120)]
    level: Literal['入门', '基础', '进阶']


class CreateChallenge(StrictModel):
    request_id: RequestId
    topic: Topic
    explanation: Annotated[Text, Field(max_length=6000)]


class Command(StrictModel):
    request_id: RequestId
    expected_revision: Annotated[int, Field(strict=True, ge=1)]


class AskQuestions(Command):
    consent: StrictBool


class Question(StrictModel):
    question_id: RequestId
    question: Annotated[Text, Field(max_length=500)]
    why_asked: Annotated[Text, Field(max_length=300)]
    based_on: Annotated[Text, Field(max_length=1000)]


class QuestionOutput(StrictModel):
    questions: Annotated[list[Question], Field(min_length=1, max_length=3)]


class Answer(StrictModel):
    question_id: RequestId
    state: Literal['answered', 'skipped']
    text: Annotated[Text, Field(max_length=2000)] | None


class SubmitAnswers(Command):
    answers: Annotated[list[Answer], Field(min_length=1, max_length=3)]


class SubmitRevision(Command):
    text: Annotated[Text, Field(max_length=6000)]


class LLMSettings(StrictModel):
    mode: Literal['live', 'mock']
    endpoint: Annotated[Text, Field(max_length=500)]
    model: Annotated[StrictStr, Field(max_length=120)]
    api_key: Annotated[SecretStr, Field(max_length=2048)] = SecretStr('')
    remember_key: StrictBool | None = None


class EditedSegment(StrictModel):
    segment_id: RequestId
    text: Annotated[StrictStr, Field(max_length=2000)]


class SaveTranscript(Command):
    segments: Annotated[list[EditedSegment], Field(min_length=1, max_length=1000)]
    confirm: StrictBool


class ReviewVideo(Command):
    transcript_version_id: Id
    consent: StrictBool


class ReviewChange(StrictModel):
    category: Literal['knowledge', 'logic', 'expression']
    segment_ids: Annotated[list[RequestId], Field(min_length=1, max_length=10)]
    reason: Annotated[Text, Field(max_length=600)]


class VideoReviewOutput(StrictModel):
    revised_script: Annotated[Text, Field(max_length=16000)]
    change_summary: Annotated[list[ReviewChange], Field(max_length=3)]
    needs_verification: Annotated[list[Annotated[Text, Field(max_length=600)]], Field(max_length=10)]


class SaveReviewScript(Command):
    text: Annotated[Text, Field(max_length=16000)]


class ASRSegment(StrictModel):
    segment_id: RequestId
    start: Annotated[float, Field(ge=0, allow_inf_nan=False)]
    end: Annotated[float, Field(gt=0, allow_inf_nan=False)]
    text: Annotated[Text, Field(max_length=2000)]


class ASRResult(StrictModel):
    engine: Literal['faster-whisper']
    engine_version: Text
    model: Literal['Systran/faster-whisper-small']
    model_revision: Literal['536b0662742c02347bc0e980a01041f333bce120']
    language: Literal['zh']
    device: Literal['cpu']
    compute_type: Literal['int8']
    duration: Annotated[float, Field(gt=0, le=180, allow_inf_nan=False)]
    elapsed_seconds: Annotated[float, Field(ge=0, allow_inf_nan=False)]
    peak_process_rss_mib: Annotated[float, Field(ge=0, allow_inf_nan=False)] | None
    source_sha256: Annotated[StrictStr, Field(pattern=r'^[0-9a-f]{64}$')]
    segments: Annotated[list[ASRSegment], Field(min_length=1, max_length=1000)]

    @model_validator(mode='after')
    def timeline(self):
        ids, last = set(), 0.0
        if sum(len(s.text) for s in self.segments) > 12000:
            raise ValueError('text too long')
        for s in self.segments:
            if s.segment_id in ids or s.start < last or not s.start < s.end <= self.duration:
                raise ValueError('invalid timeline')
            ids.add(s.segment_id)
            last = s.end
        return self
