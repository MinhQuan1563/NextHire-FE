import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DialogModule } from "primeng/dialog";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { ToolbarModule } from "primeng/toolbar";
import { TooltipModule } from "primeng/tooltip";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService, MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { CVSection } from "@app/models/cv-builder/cv-template.model";
import { CvTemplateStore } from "../../stores/cv-template.store";
import { SectionDialogComponent } from "./section-dialog/section-dialog.component";
import { v4 as uuidv4 } from "uuid";
@Component({
  selector: "app-manage-section",
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    SectionDialogComponent,
  ],
  templateUrl: "./manage-section.component.html",
  styleUrl: "./manage-section.component.scss",
  providers: [ConfirmationService, MessageService],
})
export class ManageSectionComponent {
  private cvTemplateStore = inject(CvTemplateStore);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  sections = this.cvTemplateStore.sections;
  showSectionModal: boolean = false;
  editingSection?: CVSection;

  onAddSection() {
    this.showSectionModal = true;
  }

  onEditSection(section: CVSection) {
    this.editingSection = section;
    this.showSectionModal = true;
  }

  onCloseSectionModal() {
    this.showSectionModal = false;
    // Small delay to ensure child component cleanup completes
    setTimeout(() => {
      this.editingSection = undefined;
    }, 0);
  }
  onDeleteSection(section: CVSection) {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn xóa section "${section.name}"?`,
      header: "Xác nhận xóa",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Xóa",
      rejectLabel: "Hủy",
      accept: () => {
        this.cvTemplateStore.deleteSection(section.id);
        this.messageService.add({
          severity: "success",
          summary: "Đã xóa",
          detail: `Section "${section.name}" đã được xóa`,
        });
      },
    });
  }
}
