export const PERMISSIONS = {
    Identity: {
        Users: 'AbpIdentity.Users',
        Roles: 'AbpIdentity.Roles',
    },

    Jobs: {
        Default: "NextHireApp.Jobs",
        Create: "NextHireApp.Jobs.Create",
        Update: "NextHireApp.Jobs.Update",
        Delete: "NextHireApp.Jobs.Delete",
        ManageCandidates: "NextHireApp.Jobs.ManageCandidates",
    },

    // Candidate nộp đơn, Recruiter duyệt
    Applications: {
        Default: "NextHireApp.Applications",
        Apply: "NextHireApp.Applications.Apply",         // Candidate: Nộp hồ sơ
        Approve: "NextHireApp.Applications.Approve",     // Recruiter: Duyệt hồ sơ
        Reject: "NextHireApp.Applications.Reject",       // Recruiter: Từ chối
        Cancel: "NextHireApp.Applications.Cancel",       // Candidate: Hủy ứng tuyển
    },

    // Recruiter tạo, Admin duyệt
    Companies: {
        Default: "NextHireApp.Companies",
        Create: "NextHireApp.Companies.Create",
        Update: "NextHireApp.Companies.Update",
        Delete: "NextHireApp.Companies.Delete",
        Verify: "NextHireApp.Companies.Verify", // Admin: Xác thực công ty
    },

    // Candidate
    UserCvs: {
        Default: "NextHireApp.UserCvs",
        Create: "NextHireApp.UserCvs.Create",
        Update: "NextHireApp.UserCvs.Update",
        Delete: "NextHireApp.UserCvs.Delete",
        SetDefault: "NextHireApp.UserCvs.SetDefault", // Chọn CV chính
        ViewAny: "NextHireApp.UserCvs.ViewAny",       // Recruiter: Xem CV của ứng viên (khi đã apply)
    },

    // Admin tạo mẫu, User xem
    CvTemplates: {
        Default: "NextHireApp.CvTemplates",
        Create: "NextHireApp.CvTemplates.Create", // Admin
        Update: "NextHireApp.CvTemplates.Update", // Admin
        Delete: "NextHireApp.CvTemplates.Delete", // Admin
    },

    // User, Recruiter, Admin
    Posts: {
        Default: "NextHireApp.Posts",
        Create: "NextHireApp.Posts.Create",
        Delete: "NextHireApp.Posts.Delete", // User xóa bài mình, Admin xóa bài vi phạm
    },

    // Admin
    Games: {
        Default: "NextHireApp.Games",
        Create: "NextHireApp.Games.Create",
        Update: "NextHireApp.Games.Update",
        Delete: "NextHireApp.Games.Delete",
        ResetScore: "NextHireApp.Games.ResetScore",
    },
};