import type { JobDraft } from '../../common/types'

export const PREFERRED_STATUS_ORDER = ['pending', 'accepted', 'rejected']

export const INITIAL_JOB_DRAFT: JobDraft = {
    companyName: '',
    jobTitle: '',
    statusId: '',
    appliedDate: '',
    description: '',
    hrContactEmail: '',
    tagIds: [],
}
