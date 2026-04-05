import { Directive, Input, TemplateRef, ViewContainerRef, effect } from '@angular/core';
import { PermissionService } from '@app/services/permission/permission.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  private policyName = '';

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {
    effect(() => {
      this.updateView();
    });
  }

  @Input() set hasPermission(policy: string) {
    this.policyName = policy;
    this.updateView();
  }

  private updateView() {
    this.viewContainer.clear();
    
    if (this.permissionService.hasPermission(this.policyName)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}