import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CvTemplate, CreateCvTemplate, UpdateCvTemplate, GetCvTemplatesInput } from '../../models/cv-builder/cv-template.model';
import { PagedResultDto } from '@app/models/page.model';

@Injectable({
  providedIn: 'root'
})
export class CvTemplateService {
  private apiUrl = `${environment.apiUrl}/CVTemplate`;

  constructor(private http: HttpClient) { }

  getCvTemplates(input: GetCvTemplatesInput = {}): Observable<PagedResultDto<CvTemplate>> {
    let params = new HttpParams();
    
    if (input.skipCount !== undefined) {
      params = params.append('skipCount', input.skipCount.toString());
    }
    if (input.maxResultCount !== undefined) {
      params = params.append('maxResultCount', input.maxResultCount.toString());
    }
    if (input.sorting) {
      params = params.append('sorting', input.sorting);
    }
    if (input.filter) {
      params = params.append('filter', input.filter);
    }

    return this.http.get<PagedResultDto<CvTemplate>>(this.apiUrl, { params });
  }

  getCvTemplateByCode(templateCode: string): Observable<CvTemplate> {
    return this.http.get<CvTemplate>(`${this.apiUrl}/${templateCode}`);
  }

  createTemplate(template: CreateCvTemplate): Observable<CvTemplate> {
    console.log(template);
    const bodyData = {
      name: template.name,
      description: template.description,
      isPublished: template.isPublished,
      type: template.type,
      sampleFileUrl: template.sampleFileUrl,
      designSettings: JSON.stringify(template.designSettings),
      layoutConfiguration: JSON.stringify(template.layoutConfiguration),
      section: JSON.stringify(template.section),
    }
    return this.http.post<CvTemplate>(this.apiUrl, bodyData);
  }

  updateTemplate(templateCode: string, template: UpdateCvTemplate): Observable<CvTemplate> {
    const bodyData = {
      name: template.name,
      description: template.description,
      type: template.type,
      sampleFileUrl: template.sampleFileUrl,
      designSettings: JSON.stringify(template.designSettings),
      layoutConfiguration: JSON.stringify(template.layoutConfiguration),
      section: JSON.stringify(template.section),
    }
    return this.http.put<CvTemplate>(`${this.apiUrl}/${templateCode}`, bodyData);
  }

  deleteTemplate(templateCode: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${templateCode}`);
  }
}