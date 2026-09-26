export interface LearningStep {
  id: string
  title: string
  titleEn: string
  task: string
  taskEn: string
  resources: { title: string; url: string }[]
}

export interface LearningPath {
  id: string
  title: string
  titleEn: string
  goal: string
  goalEn: string
  destination: string
  steps: LearningStep[]
}

export interface LearningProgress {
  version: 1
  entries: { stepId: string; completed: boolean; note: string; updatedAt: string }[]
}
