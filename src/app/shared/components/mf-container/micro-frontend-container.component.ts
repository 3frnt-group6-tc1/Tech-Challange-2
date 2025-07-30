import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { mfConfig } from '../../../app.config';

@Component({
  selector: 'app-micro-frontend-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <iframe
      *ngIf="iframeSrc"
      [src]="iframeSrc"
      id="micro-frontend-container"
      scrolling="no"
    ></iframe>
  `,
  styleUrls: ['./micro-frontend-container.component.scss'],
})
export class MicroFrontendContainerComponent implements OnInit {
  ngAfterViewInit() {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'microfront:navigate') {
        const link = event.data.link;
        if (link) {
          this.router.navigateByUrl(link);
        }
      }
    });
  }
  iframeSrc: SafeResourceUrl | null = null;

  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    const path = this.router.url;
    if (path === '/' || path.startsWith('/#')) {
      this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
        mfConfig.siteUrl
      );
    }
  }
}
