from typing import Annotated, Literal
from pydantic import BaseModel, ConfigDict, Field, StrictStr, StrictBool, SecretStr, StringConstraints

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
    api_key: SecretStr = SecretStr('')
