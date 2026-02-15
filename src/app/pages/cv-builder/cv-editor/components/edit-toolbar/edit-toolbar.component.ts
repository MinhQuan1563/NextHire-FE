import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  EditToolbarService,
  TextFormatState,
} from "../../services/edit-toolbar.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-edit-toolbar",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./edit-toolbar.component.html",
  styleUrls: ["./edit-toolbar.component.scss"],
})
export class EditToolbarComponent implements OnInit, OnDestroy {
  @Input() show: boolean = false;
  @Input() position: { x: number; y: number } = { x: 0, y: 0 };

  // Format state
  formatState: TextFormatState = {
    bold: false,
    italic: false,
    underline: false,
    fontSize: 14,
    fontFamily: "Roboto",
    color: "#000000",
    alignment: "left",
    isList: false,
  };

  // Font options
  fontSizes = [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 48];

  fontFamilies = [
    { label: "Roboto", value: "Roboto" },
    { label: "Open Sans", value: "Open Sans" },
    { label: "Lato", value: "Lato" },
    { label: "Montserrat", value: "Montserrat" },
    { label: "Raleway", value: "Raleway" },
    { label: "Poppins", value: "Poppins" },
    { label: "Nunito", value: "Nunito" },
    { label: "Ubuntu", value: "Ubuntu" },
    { label: "Playfair Display", value: "Playfair Display" },
    { label: "Merriweather", value: "Merriweather" },
    { label: "Georgia", value: "Georgia" },
    { label: "Times New Roman", value: "Times New Roman" },
    { label: "Arial", value: "Arial" },
    { label: "Helvetica", value: "Helvetica" },
    { label: "Courier New", value: "Courier New" },
  ];

  // Color picker state
  showColorPicker = false;

  // Predefined colors
  colorPalette = [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FFFFFF",
    "#FF0000",
    "#FF6B6B",
    "#FFA500",
    "#FFD93D",
    "#00B14F",
    "#6BCB77",
    "#0EA5E9",
    "#3B82F6",
    "#8B5CF6",
    "#EC4899",
  ];

  private subscription = new Subscription();

  constructor(private editToolbarService: EditToolbarService) {}

  ngOnInit() {
    // Subscribe to toolbar state to update format state
    this.subscription.add(
      this.editToolbarService.toolbarState$.subscribe((state) => {
        if (state.visible && state.activeElement) {
          // Update format state when toolbar becomes visible
          setTimeout(() => {
            this.updateFormatState();
          }, 50);
        }
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  /**
   * Update format state from active element
   */
  updateFormatState() {
    this.formatState = this.editToolbarService.getCurrentFormatState();
  }

  /**
   * Hide toolbar
   */
  onHide() {
    this.showColorPicker = false;
    this.editToolbarService.hideToolbar();
  }

  /**
   * Toggle bold formatting
   */
  onBold() {
    this.editToolbarService.applyBold();
    setTimeout(() => this.updateFormatState(), 50);
  }

  /**
   * Toggle italic formatting
   */
  onItalic() {
    this.editToolbarService.applyItalic();
    setTimeout(() => this.updateFormatState(), 50);
  }

  /**
   * Toggle underline formatting
   */
  onUnderline() {
    this.editToolbarService.applyUnderline();
    setTimeout(() => this.updateFormatState(), 50);
  }

  /**
   * Create bullet list
   */
  onBulletList() {
    this.editToolbarService.createBulletList();
    setTimeout(() => this.updateFormatState(), 50);
  }

  /**
   * Create numbered list
   */
  onNumberList() {
    this.editToolbarService.createNumberList();
    setTimeout(() => this.updateFormatState(), 50);
  }

  /**
   * Change font size
   */
  onFontSizeChange(event: any) {
    const size = parseInt(event.target.value);
    this.formatState.fontSize = size;
    this.editToolbarService.changeFontSize(size);
  }

  /**
   * Change font family
   */
  onFontFamilyChange(event: any) {
    const fontFamily = event.target.value;
    this.formatState.fontFamily = fontFamily;
    this.editToolbarService.changeFontFamily(fontFamily);
  }

  /**
   * Toggle color picker
   */
  toggleColorPicker(event: Event) {
    event.stopPropagation();
    this.showColorPicker = !this.showColorPicker;
  }

  /**
   * Select color from palette
   */
  selectColor(color: string) {
    this.formatState.color = color;
    this.editToolbarService.changeTextColor(color);
    this.showColorPicker = false;
  }

  /**
   * Change color from color input
   */
  onColorChange(event: any) {
    const color = event.target.value;
    this.formatState.color = color;
    this.editToolbarService.changeTextColor(color);
  }

  /**
   * Align left
   */
  onAlignLeft() {
    this.editToolbarService.alignLeft();
    setTimeout(() => this.updateFormatState(), 50);
  }

  /**
   * Align center
   */
  onAlignCenter() {
    this.editToolbarService.alignCenter();
    setTimeout(() => this.updateFormatState(), 50);
  }

  /**
   * Align right
   */
  onAlignRight() {
    this.editToolbarService.alignRight();
    setTimeout(() => this.updateFormatState(), 50);
  }

  /**
   * Align justify
   */
  onAlignJustify() {
    this.editToolbarService.alignJustify();
    setTimeout(() => this.updateFormatState(), 50);
  }

  /**
   * Check if a button is active
   */
  isActive(type: string): boolean {
    switch (type) {
      case "bold":
        return this.formatState.bold;
      case "italic":
        return this.formatState.italic;
      case "underline":
        return this.formatState.underline;
      case "left":
        return this.formatState.alignment === "left";
      case "center":
        return this.formatState.alignment === "center";
      case "right":
        return this.formatState.alignment === "right";
      case "justify":
        return this.formatState.alignment === "justify";
      case "list":
        return this.formatState.isList;
      default:
        return false;
    }
  }

  /**
   * Stop propagation for dropdown interactions
   */
  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
