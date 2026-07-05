import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { UpdateBanner } from './update-banner/update-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, UpdateBanner],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  appName = 'Task Tracker';
}
