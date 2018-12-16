import { TestBed } from '@angular/core/testing';

import { KanbanCardsService } from './kanban-cards.service';

describe('KanbanCardsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: KanbanCardsService = TestBed.get(KanbanCardsService);
    expect(service).toBeTruthy();
  });
});
