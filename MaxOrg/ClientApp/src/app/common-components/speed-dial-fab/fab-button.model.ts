export class FabButton {

  icon: string;

  tooltip: string;

  color: string;

  disabled: boolean = false;

  private button?: HTMLElement;

  constructor(options?: {
    icon: string,
    tooltip: string,
    color?: string,
    disabled?: boolean,
    button?: HTMLElement
  }) {
    this.icon = options.icon || 'extension';
    this.tooltip = options.tooltip;
    this.color = options.color || 'secondary';
    this.disabled = options.disabled || false;
    this.button = options.button;
  }

  static build(button: HTMLElement): FabButton {
    const matIcon: any = button.getElementsByTagName('mat-icon')[0];
    const icon: string = (matIcon && matIcon.innerText) || button.getAttribute('fab-icon');

    const tooltip = button.getAttribute('mattooltip')
      || button.getAttribute('fab-tooltip')
      || button.innerText
      || icon;

    const color: string = button.getAttribute('color');

    const disabled = (button as HTMLButtonElement).disabled || button.hasAttribute('disabled');

    return new FabButton({icon, tooltip, color, disabled, button});
  }

  click(): void {
    this.button && this.button.click();
  }

}
