import { Component, ElementRef, ViewChild, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '@app/services/auth/auth.service';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

@Component({
  selector: 'app-video-call',
  standalone: true,
  imports: [],
  templateUrl: './video-call.component.html',
  styleUrl: './video-call.component.scss'
})
export class VideoCallComponent implements AfterViewInit {
  @ViewChild('videoContainer') videoContainer!: ElementRef;
  @Input() roomId!: string;
  @Output() onCallEnded = new EventEmitter<void>();
  @Input() isVideoCall: boolean = true;
  @Input() isCaller: boolean = false;
  @Input() partnerName: string = '';

  constructor(private authService: AuthService) {}

  ngAfterViewInit() {
    this.joinRoom();
  }

  joinRoom() {
    const appID = 185239144;
    const serverSecret = "5baadb803a5cd3eea514b0b4eb3cb902"; 

    const userCode = this.authService.getUserCodeFromToken() || '';
    const userName = this.authService.getCurrentUser()?.fullName || 'NextHire User';

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID, 
      serverSecret, 
      this.roomId, 
      userCode, 
      userName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: this.videoContainer.nativeElement,
      sharedLinks: [
        {
          name: 'Copy Link',
          url: window.location.origin + '/call?roomId=' + this.roomId,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: this.isVideoCall,
      showMyCameraToggleButton: this.isVideoCall,
      showPreJoinView: false,
      onLeaveRoom: () => {
        this.closeCall();
      }
    });
  }

  closeCall() {
    this.onCallEnded.emit();
  }
}
