export enum CvTemplateType {
  Resume = 0,
  CoverLetter = 1,
  Portfolio = 2
}

export interface CvTemplate {
  id: string;
  templateCode: string;
  name: string;
  type: CvTemplateType;
  description: string;
  sampleFileUrl: string;
  isPublished: boolean;
  createDate: Date;
  modifiedDate: Date;
  layoutConfiguration?: string;
}

export interface CreateCvTemplate {
  name: string;
  type: CvTemplateType;
  description?: string;
  sampleFileUrl?: string;
  layoutConfiguration?: string;
  isPublished?: boolean;
}

export interface UpdateCvTemplate {
  name?: string;
  type?: CvTemplateType;
  description?: string;
  sampleFileUrl?: string;
  layoutConfiguration?: string;
}

export interface GetCvTemplatesInput {
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string;
  filter?: string;
}