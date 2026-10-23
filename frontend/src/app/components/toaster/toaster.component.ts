import { Component, inject } from '@angular/core';

import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../icon/icon.component';

/** Renders the messages from ToastService. Placed once, in app.component.html. */
@Component({
  selector: 'app-toaster',
  imports: [IconComponent],
  templateUrl: './toaster.component.html',
  styleUrl: './toaster.component.scss',
})
export class ToasterComponent {
  protected readonly toastService = inject(ToastService);
}
