import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { ToastService } from '@app/services/toast/toast.service';
import { PermissionManagementService } from '@app/services/permission/permission-management.service';

@Component({
  selector: 'app-role-permissions',
  standalone: true,
  imports: [
    CommonModule, FormsModule, DropdownModule, 
    CheckboxModule, ButtonModule, AccordionModule
  ],
  templateUrl: './role-permissions.component.html',
  styleUrls: ['./role-permissions.component.scss']
})
export class RolePermissionsComponent implements OnInit {
  private permissionService = inject(PermissionManagementService);
  private toastService = inject(ToastService);

  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Recruiter', value: 'recruiter' },
    { label: 'Candidate', value: 'candidate' }
  ];
  
  selectedRole: string = 'candidate';
  permissionGroups: any[] = [];
  isLoading = false;
  isSaving = false;

  ngOnInit() {
    this.loadPermissions();
  }

  onRoleChange() {
    this.loadPermissions();
  }

  loadPermissions() {
    if (!this.selectedRole) return;
    this.isLoading = true;
    this.permissionService.getPermissionsByRole(this.selectedRole).subscribe({
      next: (res) => {
        this.permissionGroups = res.groups.map(group => {
          const parentPerms = group.permissions.filter(p => !p.parentName);
          
          const structuredPerms = parentPerms.map(parent => {
            return {
              ...parent,
              children: group.permissions.filter(p => p.parentName === parent.name)
            };
          });

          return {
            ...group,
            structuredPerms
          };
        });

        this.isLoading = false;
      },
      error: (err) => {
        this.toastService.showError('Error', 'Unable to load permission configuration');
        this.isLoading = false;
      }
    });
  }

  // Xử lý Checkbox khi click quyền Cha
  onParentPermissionChange(group: any, parentPerm: any) {
    if (parentPerm.children && parentPerm.children.length > 0) {
      parentPerm.children.forEach((child: any) => {
        child.isGranted = parentPerm.isGranted;
      });
    }
  }

  // Xử lý Checkbox khi click quyền Con
  onChildPermissionChange(group: any, parentPerm: any, childPerm: any) {
    if (childPerm.isGranted) {
      parentPerm.isGranted = true;
    } 
    else {
      const anyChildGranted = parentPerm.children.some((c: any) => c.isGranted);
      if (!anyChildGranted) {
        parentPerm.isGranted = false;
      }
    }
  }

  savePermissions() {
    this.isSaving = true;
    
    const allPermissions: any[] = [];
    this.permissionGroups.forEach(group => {
      group.structuredPerms.forEach((parent: any) => {
        allPermissions.push({ name: parent.name, isGranted: parent.isGranted });
        if (parent.children) {
          parent.children.forEach((child: any) => {
            allPermissions.push({ name: child.name, isGranted: child.isGranted });
          });
        }
      });
    });

    const payload = { permissions: allPermissions };

    this.permissionService.updatePermissions(this.selectedRole, payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Success', 'Permissions updated successfully!');
        this.isSaving = false;
      },
      error: () => {
        this.toastService.showError('Failure', 'An error occurred while saving permissions.');
        this.isSaving = false;
      }
    });
  }
}