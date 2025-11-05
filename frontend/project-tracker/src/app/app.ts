import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { LanguageSelectorComponent } from '../shared/components/language-selector.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe, LanguageSelectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('project-tracker');
}
