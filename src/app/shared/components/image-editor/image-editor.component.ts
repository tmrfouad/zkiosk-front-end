import { AfterViewInit, Component, EventEmitter, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

declare const Cropper: any;

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.css']
})
export class ImageEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  public state: EditorOptions;
  public cropper: any;
  public croppedImage: string;
  public imageWidth: number;
  public imageHeight: number;
  public canvasWidth: number;
  public canvasHeight: number;
  public cropBoxWidth: number;
  public cropBoxHeight: number;
  public canvasFillColor: string;
  public blob: Blob;
  public loading: boolean;
  private zoomIn: number;
  public sliderValue: number;
  public ratios: NgxAspectRatio[];
  public previewImageURL: any;

  @ViewChild('previewimg')
  public previewImage: any;

  @ViewChild('croppedImg')
  public croppedImg: any;

  public set config(config: EditorOptions) {
    this.state = config;
  }

  imgEditorConfig: {
    ImageName?: string,
    ImageUrl?: string,
    File?: any,
    ImageType?: string,
    AspectRatios?: string[]
  } = {
      // AspectRatios: ['0:0', '1:1', '2:3', '4:3', '16:9']
      AspectRatios: ['1:1']
    };

  constructor(
    private dialogRef: MatDialogRef<ImageEditorComponent>,
    @Inject(MAT_DIALOG_DATA) private data: ImageEditorData
  ) {
    this.zoomIn = 0;
    this.sliderValue = 0;
    this.loading = true;
    this.canvasFillColor = '#fff';
    this.state = new EditorOptions();
  }

  ngOnInit() {
    this.imgEditorConfig.ImageName = this.data.imageName;
    this.imgEditorConfig.ImageUrl = this.data.imageUrl;
    this.config = this.imgEditorConfig as EditorOptions;

    this.handleStateConfig();

  }

  public ngOnDestroy() {
    this.cropper.destroy();
  }

  public ngAfterViewInit(): void {

    // NOTE if we don't have a file meaning that loading the image will happen synchronously we can safely
    // call initializeCropper in ngAfterViewInit. otherwise if we are using the FileReader to load a base64 image
    // we need to call onloadend asynchronously..
    if (!this.state.File && this.state.ImageUrl) {
      this.initializeCropper();
    }
  }

  private handleStateConfig() {
    this.state.ImageType = this.state.ImageType ? this.state.ImageType : 'image/jpeg';

    if (this.state.ImageUrl) {
      this.state.File = null;
      this.previewImageURL = this.state.ImageUrl;
    }

    if (this.state.File) {
      this.state.ImageUrl = null;
      this.convertFileToBase64(this.state.File);
    }

    if (this.state.AspectRatios) {
      this.addRatios(this.state.AspectRatios);
    } else {
      this.ratios = NGX_DEFAULT_RATIOS;
    }


    if (!this.state.ImageUrl && !this.state.File) {
      console.error('Property ImageUrl or File is missing, Please provide an url or file in the config options.');
    }

    if (!this.state.ImageName) {
      console.error('Property ImageName is missing, Please provide a name for the image.');
    }
  }

  private convertFileToBase64(file: File) {
    const reader = new FileReader();
    reader.addEventListener('load', (e: any) => {
      this.previewImageURL = e.target['result'];
    }, false);
    reader.readAsDataURL(file);
    reader.onloadend = (() => {
      // NOTE since getting the base64 image url happens asynchronously we need to initializeCropper after
      // the image has been loaded.
      this.initializeCropper();
    });
  }

  private addRatios(ratios: RatioType[]) {
    this.ratios = [];
    ratios.forEach((ratioType: RatioType) => {
      const addedRation = NGX_DEFAULT_RATIOS.find((ratio: NgxAspectRatio) => {
        return ratio.text === ratioType;
      });
      this.ratios.push(addedRation);
    });
  }

  public handleCrop() {

    this.loading = true;
    setTimeout(() => {
      this.croppedImage = this.cropper.getCroppedCanvas({ fillColor: this.canvasFillColor })
        .toDataURL(this.state.ImageType);

      setTimeout(() => {
        this.imageWidth = this.croppedImg.nativeElement.width;
        this.imageHeight = this.croppedImg.nativeElement.height;
      });
      this.cropper.getCroppedCanvas({ fillColor: this.canvasFillColor }).toBlob((blob: Blob) => {
        this.blob = blob;
      });
      this.zoomIn = 1;
      this.loading = false;
    }, 2000);
  }

  public undoCrop() {
    this.croppedImage = null;
    this.blob = null;
    setTimeout(() => {
      this.initializeCropper();
    }, 100);

  }

  public saveImage() {
    const file = new File([this.blob], this.state.ImageName, { type: this.state.ImageType });
    this.dialogRef.close(<ImageEditorResult>{ action: 'ok', file: file });
  }

  private initializeCropper() {
    this.cropper = new Cropper(this.previewImage.nativeElement, {
      zoomOnWheel: true,
      viewMode: 0,
      center: true,
      ready: () => this.loading = false,
      dragMode: 'move',
      crop: (e: CustomEvent) => {
        this.imageHeight = Math.round(e.detail.height);
        this.imageWidth = Math.round(e.detail.width);
        this.cropBoxWidth = Math.round(this.cropper.getCropBoxData().width);
        this.cropBoxHeight = Math.round(this.cropper.getCropBoxData().height);
        this.canvasWidth = Math.round(this.cropper.getCanvasData().width);
        this.canvasHeight = Math.round(this.cropper.getCanvasData().height);
      }
    });

    this.setRatio(this.ratios[0].value);
  }

  public setRatio(value: any) {
    this.cropper.setAspectRatio(value);
  }

  public zoomChange(input: any, zoom?: string) {
    if (this.croppedImage) {
      if (zoom) {
        zoom === 'zoomIn' ? this.zoomIn += 0.1 : this.zoomIn -= 0.1;
      } else {
        if (input < this.sliderValue) {
          this.zoomIn = -Math.abs(input / 100);
        } else {
          this.zoomIn = Math.abs(input / 100);
        }
      }
      if (this.zoomIn <= 0.1) {
        this.zoomIn = 0.1;
      }
    } else {
      if (zoom) {
        this.cropper.zoom(input);
        this.zoomIn = input;
      } else {
        if (input < this.sliderValue) {
          this.cropper.zoom(-Math.abs(input / 100));
        } else {
          this.cropper.zoom(Math.abs(input / 100));
        }
        if (input === 0) {
          this.cropper.zoom(-1);
        }
      }
    }

    if (!zoom) {
      this.sliderValue = input;
    } else {
      input > 0 ? this.sliderValue += Math.abs(input * 100) : this.sliderValue -= Math.abs(input * 100);
    }

    if (this.sliderValue < 0) {
      this.sliderValue = 0;
    }
  }

  public setImageWidth(canvasWidth: number) {
    if (canvasWidth) {
      this.cropper.setCanvasData({
        left: this.cropper.getCanvasData().left,
        top: this.cropper.getCanvasData().top,
        width: Math.round(canvasWidth),
        height: this.cropper.getCanvasData().height
      });
    }
  }

  public setImageHeight(canvasHeight: number) {
    if (canvasHeight) {
      this.cropper.setCanvasData({
        left: this.cropper.getCanvasData().left,
        top: this.cropper.getCanvasData().top,
        width: this.cropper.getCanvasData().width,
        height: Math.round(canvasHeight)
      });
    }
  }

  public setCropBoxWidth(cropBoxWidth: number) {
    if (cropBoxWidth) {
      this.cropper.setCropBoxData({
        left: this.cropper.getCropBoxData().left,
        top: this.cropper.getCropBoxData().top,
        width: Math.round(cropBoxWidth),
        height: this.cropper.getCropBoxData().height
      });
    }
  }

  public setCropBoxHeight(cropBoxHeight: number) {
    if (cropBoxHeight) {
      this.cropper.setCropBoxData({
        left: this.cropper.getCropBoxData().left,
        top: this.cropper.getCropBoxData().top,
        width: this.cropper.getCropBoxData().width,
        height: Math.round(cropBoxHeight)
      });
    }
  }

  public centerCanvas() {
    const cropBoxLeft = (this.cropper.getContainerData().width - this.cropper.getCropBoxData().width) / 2;
    const cropBoxTop = (this.cropper.getContainerData().height - this.cropper.getCropBoxData().height) / 2;
    const canvasLeft = (this.cropper.getContainerData().width - this.cropper.getCanvasData().width) / 2;
    const canvasTop = (this.cropper.getContainerData().height - this.cropper.getCanvasData().height) / 2;

    this.cropper.setCropBoxData({
      left: cropBoxLeft,
      top: cropBoxTop,
      width: this.cropper.getCropBoxData().width,
      height: this.cropper.getCropBoxData().height
    });
    this.cropper.setCanvasData({
      left: canvasLeft,
      top: canvasTop,
      width: this.cropper.getCanvasData().width,
      height: this.cropper.getCanvasData().height
    });
  }

  cancel() {
    this.dialogRef.close(<ImageEditorResult>{ action: 'cancel' });
  }
}


export interface IEditorOptions {
  ImageName: string;
  ImageUrl?: string;
  ImageType?: string;
  File?: File;
  AspectRatios?: Array<RatioType>;
}

export type RatioType = '16:9' | '4:3' | '1:1' | '2:3' | 'Default';

export class EditorOptions implements IEditorOptions {
  ImageName: string;
  ImageUrl?: string;
  ImageType?: string;
  File?: File;
  AspectRatios?: Array<RatioType>;
}


export interface NgxAspectRatio {
  value: number;
  text: RatioType;
}



export const NGX_DEFAULT_RATIOS: Array<NgxAspectRatio> = [
  {
    value: 16 / 9, text: '16:9'
  },
  {
    value: 4 / 3, text: '4:3'
  },
  {
    value: 1 / 1, text: '1:1'
  },
  {
    value: 2 / 3, text: '2:3'
  },
  {
    value: 0 / 0, text: 'Default'
  }
];

export interface ImageEditorData {
  imageName: string;
  imageUrl?: string;
  file: File;
}

export interface ImageEditorResult {
  action: string;
  file?: File;
}
