import { Routes } from '@angular/router';

import { NoteEditorComponent } from './components/note-editor/note-editor.component';
import { NoteEmptyComponent } from './components/note-empty/note-empty.component';
import { NotesLayoutComponent } from './components/notes-layout/notes-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'notes' },
  {
    path: 'notes',
    component: NotesLayoutComponent, // sidebar stays on screen; the child route fills the right side
    children: [
      { path: '', component: NoteEmptyComponent, title: 'Notes' },
      { path: ':id', component: NoteEditorComponent }, // the editor sets the tab title itself
    ],
  },
  {
    path: 'design-system',
    title: 'Design system · Notes',
    // Loaded only when visited, so it doesn't slow down the main app.
    loadComponent: () =>
      import('./components/design-system/design-system.component').then(
        (m) => m.DesignSystemComponent,
      ),
  },
  { path: '**', redirectTo: 'notes' },
];
