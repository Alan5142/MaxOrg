import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList
} from '@angular/core';
import {FabButton} from './fab-button.model';
import {speedDialFabAnimations} from './speed-dial-fab.animations';
import {DomChangeService} from '../shared/dom-change.service';
import {InViewportEntry, InViewportService} from '../shared/in-viewport.service';

/**
  * Component to create a FAB (Float Action Buttons). The buttons may
  * be passed in a static way by the input `fabButtons` and/or dynamically
  * by input `containerButtons`.
  *
  * `fabButtons` is an array of {@link FabButton}.
  *
  * `containerButtons` must be an element (or an array of elements) that contain the elements
  * `button` and/or `a`. That way the buttons marked with `toFAB` will appear on the FAB.
  * Changes to the DOM of `containerButtons` are observed by means of a` MutationObserver`
  * to update the FAB, such as change disable/enable, color, etc.
  *
  * It is possible to specify in which corner the FAB should appear through the
  * inputs `xPosition` and` yPosition`.
  *
  * It is also possible to simply tell whether FAB should appear or
  * not through two inputs:
  * - The `show` input if `true` displays the buttons, if `false` does not;
  * - The `showIfInViewport` input receives an element that is observed by an `IntersectionObserver`
  * and if this element is in the viewport the FAB **do not appear**, if it is
  * out of the viewport the FAB **appear**.
  *
  * When you click a floating button, two things happen:
  * - The click event of the original button is triggered;
  * - The `fabClick` output raise an event with the {@link FabButton} instance clicked.
  */
@Component({
  selector: 'app-speed-dial-fab',
  templateUrl: './speed-dial-fab.component.html',
  styleUrls: ['./speed-dial-fab.component.scss'],
  animations: speedDialFabAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpeedDialFabComponent implements OnInit, OnDestroy {

  private changes: MutationObserver;
  private intersect: IntersectionObserver;

  @Input()
  fabButtons: FabButton[] = [];

  private _containerButtons: HTMLElement[] = [];

  @Input()
  set containerButtons(containers: HTMLElement | HTMLElement[] | ElementRef | ElementRef[] | QueryList<ElementRef>) {
    if (containers instanceof HTMLElement) {
      this._containerButtons = [containers];
    }
    if (containers instanceof ElementRef) {
      this._containerButtons = [containers.nativeElement];
    }
    if (containers instanceof QueryList) {
      this._containerButtons = containers.map(e => e.nativeElement);
    }
    if (Array.isArray(containers)) {
      const first = containers[0];
      if (first instanceof HTMLElement) {
        this._containerButtons = containers as HTMLElement[];
      }
      if (first instanceof ElementRef) {
        this._containerButtons = (containers as ElementRef[]).map(e => e.nativeElement);
      }
    }
  }

  private otherFabButtons: FabButton[] = [];

  @Input() fabIcon: string = 'add';
  private _canClick: boolean = true;

  @Input()
  set canClick(value: boolean) {
    this.hideItems();
    this._canClick = value;
  }

  @Input() xPosition: 'left' | 'right' = 'right';
  @Input() yPosition: 'top' | 'bottom' = 'bottom';

  @Input() showIfInViewport: HTMLElement;
  @Input() show: boolean = true;

  private mark: string = 'tofab';

  @Output()
  fabClick = new EventEmitter<FabButton>();

  @Output()
  fabToggleClick = new EventEmitter<void>();

  buttons: FabButton[] = [];
  fabTogglerState: 'active' | 'inactive' = 'inactive';

  constructor(
    private cdRef: ChangeDetectorRef,
    private domChangeService: DomChangeService,
    private inViewportService: InViewportService
  ) {
  }

  private getElementsByTagName(containers: HTMLElement[], qualifiedName: string): HTMLElement[] {
    const allElements = containers
      .map(container => container.getElementsByTagName(qualifiedName))
      .map(buttons => Array.from(buttons))
      .map(buttons => buttons as HTMLElement[]);

    // Planificando (convertendo todos os arrays em um único array)
    return ([] as HTMLElement[]).concat(...allElements);
  }

  private getAllButtons(containers: HTMLElement[]): HTMLElement[] {
    const allButtons = this.getElementsByTagName(containers, 'button');
    const allAnchors = this.getElementsByTagName(containers, 'a');
    return allButtons.concat(allAnchors);
  }

  private refreshOtherFabButtons() {
    const allButtons = this.getAllButtons(this._containerButtons);

    this.otherFabButtons = allButtons
      .filter(button => button.hasAttribute(this.mark))
      .map(button => FabButton.build(button));

    // Se estiver exibindo, atualizar
    if (this.fabTogglerState === 'active') {
      this.showItems();
      this.cdRef.detectChanges();
    }
  }

  ngOnInit(): void {
    // Apenas para não ter o efeito visual de aparecer e desaparecer em seguida
    // no caso em que o `showIfInViewport` é passado
    if (this.showIfInViewport) {
      this.show = false;
    }

    if (this._containerButtons) {
      // Observando mudança nos botões para atualizar no FAB
      this.changes = this.domChangeService.observe(
        this._containerButtons,
        _ => this.refreshOtherFabButtons()
      );
    }

    if (this.showIfInViewport) {
      // Observando se o elemento `showIfInViewport` está ou não no viewport
      this.intersect = this.inViewportService.observe(
        this.showIfInViewport,
        (entry: InViewportEntry) => {
          this.show = !entry.entries[0].isIntersecting;
          this.cdRef.detectChanges();
        }
      );
    }
  }

  get reverseColumnDirection(): boolean {
    return this.yPosition === 'bottom';
  }

  private showItems() {
    this.fabTogglerState = 'active';
    this.buttons = this.fabButtons.concat(this.otherFabButtons);
  }

  private hideItems() {
    this.fabTogglerState = 'inactive';
    this.buttons = [];
  }

  public onToggleFab() {
    this.fabToggleClick.emit();
    if (!this._canClick) {
      return;
    }
    this.buttons.length ? this.hideItems() : this.showItems();
  }

  public close() {
    this.hideItems();
  }

  public onClickFab(btn: FabButton) {
    this.hideItems();
    btn.click();
    this.fabClick.emit(btn);
  }

  ngOnDestroy(): void {
    this.changes && this.changes.disconnect();
    this.intersect && this.intersect.disconnect();
  }

}
