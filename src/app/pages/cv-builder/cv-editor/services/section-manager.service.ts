import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Experience {
  position: string;
  company: string;
  duration: string;
  responsibilities: string[];
}

export interface Education {
  degree: string;
  school: string;
  year: string;
  gpa: string;
}

export interface Activity {
  title: string;
  organization: string;
  description: string;
}

export interface Certificate {
  name: string;
  issuer: string;
}

export interface Project {
  title: string;
  technology: string;
  description: string;
}

export interface Reference {
  name: string;
  position: string;
  contact: string;
}

export interface CVData {
  experiences: Experience[];
  education: Education[];
  activities: Activity[];
  certificates: Certificate[];
  projects: Project[];
  references: Reference[];
}

@Injectable({
  providedIn: 'root'
})
export class SectionManagerService {
  private cvDataSubject = new BehaviorSubject<CVData>({
    experiences: [{
      position: 'Frontend Developer',
      company: 'Công ty ABC Tech',
      duration: '2022 - Hiện tại',
      responsibilities: [
        'Phát triển và duy trì ứng dụng web sử dụng Angular, React',
        'Tối ưu hiệu suất và trải nghiệm người dùng',
        'Phối hợp với team Backend và Designer'
      ]
    }],
    education: [{
      degree: 'Kỹ sư Công nghệ thông tin',
      school: 'Đại học Bách Khoa Hà Nội',
      year: '2018 - 2022',
      gpa: 'GPA: 3.5/4.0'
    }],
    activities: [{
      title: 'Trưởng Ban Tổ chức',
      organization: 'Câu lạc bộ Lập trình',
      description: 'Tổ chức các buổi workshop về lập trình web'
    }],
    certificates: [{
      name: 'Angular Developer Certification',
      issuer: 'Google'
    }],
    projects: [{
      title: 'E-commerce Website',
      technology: 'Angular, Node.js, MongoDB',
      description: 'Xây dựng website thương mại điện tử hoàn chỉnh với quản lý sản phẩm, giỏ hàng và thanh toán online'
    }],
    references: [{
      name: 'Nguyễn Văn B',
      position: 'Team Lead - Công ty ABC',
      contact: 'nguyen.vanb@abc.com | 0987 654 321'
    }]
  });

  public cvData$ = this.cvDataSubject.asObservable();

  getCVData(): CVData {
    return this.cvDataSubject.value;
  }

  updateCVData(data: CVData) {
    this.cvDataSubject.next(data);
  }

  // Experience methods
  addExperience() {
    const currentData = this.getCVData();
    currentData.experiences.push({
      position: 'Vị trí công việc',
      company: 'Tên công ty',
      duration: 'Thời gian',
      responsibilities: ['Mô tả công việc']
    });
    this.updateCVData(currentData);
  }

  removeExperience(index: number) {
    const currentData = this.getCVData();
    currentData.experiences.splice(index, 1);
    this.updateCVData(currentData);
  }

  addResponsibility(expIndex: number) {
    const currentData = this.getCVData();
    currentData.experiences[expIndex].responsibilities.push('Trách nhiệm mới');
    this.updateCVData(currentData);
  }

  removeResponsibility(expIndex: number, respIndex: number) {
    const currentData = this.getCVData();
    currentData.experiences[expIndex].responsibilities.splice(respIndex, 1);
    this.updateCVData(currentData);
  }

  // Education methods
  addEducation() {
    const currentData = this.getCVData();
    currentData.education.push({
      degree: 'Bằng cấp',
      school: 'Trường học',
      year: 'Năm học',
      gpa: 'GPA'
    });
    this.updateCVData(currentData);
  }

  removeEducation(index: number) {
    const currentData = this.getCVData();
    currentData.education.splice(index, 1);
    this.updateCVData(currentData);
  }

  // Activity methods
  addActivity() {
    const currentData = this.getCVData();
    currentData.activities.push({
      title: 'Tên hoạt động',
      organization: 'Tổ chức',
      description: 'Mô tả'
    });
    this.updateCVData(currentData);
  }

  removeActivity(index: number) {
    const currentData = this.getCVData();
    currentData.activities.splice(index, 1);
    this.updateCVData(currentData);
  }

  // Certificate methods
  addCertificate() {
    const currentData = this.getCVData();
    currentData.certificates.push({
      name: 'Tên chứng chỉ',
      issuer: 'Đơn vị cấp'
    });
    this.updateCVData(currentData);
  }

  removeCertificate(index: number) {
    const currentData = this.getCVData();
    currentData.certificates.splice(index, 1);
    this.updateCVData(currentData);
  }

  // Project methods
  addProject() {
    const currentData = this.getCVData();
    currentData.projects.push({
      title: 'Tên dự án',
      technology: 'Công nghệ sử dụng',
      description: 'Mô tả dự án'
    });
    this.updateCVData(currentData);
  }

  removeProject(index: number) {
    const currentData = this.getCVData();
    currentData.projects.splice(index, 1);
    this.updateCVData(currentData);
  }

  // Reference methods
  addReference() {
    const currentData = this.getCVData();
    currentData.references.push({
      name: 'Tên người tham chiếu',
      position: 'Vị trí - Công ty',
      contact: 'Email | SĐT'
    });
    this.updateCVData(currentData);
  }

  removeReference(index: number) {
    const currentData = this.getCVData();
    currentData.references.splice(index, 1);
    this.updateCVData(currentData);
  }
}