export class Product {
    productId ?: string;
    memberId ?: string;
    productName ?: string;
    price ?: number;
    groupId ?: number;
    coralSpecies ?: number;
    flowIntensity ?: number;
    lightingIntensity ?: number;
    alkalinity ?: string;
    nitrate ?: string;
    phosphate ?: string;
    calcium ?: string;
    magnesium ?: string;
    description ?: string;
    productImages ?: any;
    howLongCutoff ?: number;
    ageOfFrag ?: any;
    dateCreated ?: string;
    itemType ?: number;
    flowIntensityName ?: string;
    lightingIntensityName ?: string;
    howLongCutoffName ?: string;
    stateCode ?: any;
    stateName ?: string;
    zipCode ?: string;
    feedbackList?:ProductDetailsFeedbackDTO[];
    member ?: Member;
    status ?: string
}

export class CreatProductDTO {
    productName: string;
    productImages: any;
    price: number | null;
    description: string | null;
    itemType: number;
    groupId: number | null;
    coralSpecies: number | null;
    flowIntensity: number | null;
    lightingIntensity: number | null;
    alkalinity: string | null;
    nitrate: string | null;
    phosphate: string | null;
    calcium: string | null;
    magnesium: string | null;
    howLongCutoff: number | null;
    ageOfFrag: Date | string | null;
    memberId: string | null;
    isSold: boolean | null;
}
export class UpdateProductDTO extends CreatProductDTO {
    productId: string;
    constructor() {
        super();
    }
}

export class Member {
  memberAvatar ?: string;
  memberId ?: string;
  memberName ?: string;
  rating ?: number;
  sold ?: number;
  numberOfRatings ?: number;
}

export class ProductListEntry {
  productName ?: string;
  productImages ?: any;
  howLongCutoff ?: number | string;
  flowIntensity ?: number | string;
  price ?: any;
}

export class Review {
    productId ?: string;
    memberId ?: string;
    feedbackMessage ?: string;
    ratingValue ?: number;
}

export class Filter {
    category ?: string;
    price ?: string;
    state ?: string;
    frag ?: string;
}
export class LookupEntry {
    name?: string;
    value?: number;
    parentId?: any;
}

export class Sale {
    productId ?: string;
    buyerId ?: string;
    quantity ?: number;
}

export class allProductsFilter {
  pageIndex ?: number;
  pageSize ?: number;
  sortDirection ?: string;
  sortColumn ?: string;
  coralSpecies ?: number;
  howLongCutoff ?: number;
  priceMin ?: number;
  priceMax ?: number;
  state ?: string;
  groupId ?: number;
}

export class allProductsEntry {
  productId ?: string;
  productName ?: string;
  price ?: number;
  description ?: string;
  productImages ?: string;
  flowIntensity ?: number;
  itemType ?: number;
  flowIntensityName ?: string;
}

export class ProductCategory {
  categoryId ?: string;
  categoryName ?: string;
  categoryImage?: string;
  groupId?: string;
}


export interface ProductFeedbackMemberDTO {
  memberName: string;
  memberAvatar: string;
  memberId: string;
}

export interface ProductDetailsFeedbackDTO {
    memberDetails: ProductFeedbackMemberDTO;
    feedbackMessage: string;
    ratingValue: number;
    dateCreated: string;
}
export interface ProductCardDTO {
  productId: string | null;
  productName: string | null;
  price: number | null;
  description: string | null;
  productImages: string | null;
  flowIntensity: number | null;
  itemType: number;
  flowIntensityName: string | null;
  stateCode: string | null;
}

export interface ProductFeedbackDetailsDTO extends ProductDetailsFeedbackDTO {
    product: ProductCardDTO;
}

export class ChatMessage{
  constructor(
    public memberAvatar ?: string | null,
    public memberName ?: string | null,
    public message ?: string | null,
    public messageId ?: string | null,
    public productId ?: string | null,
    public receiverId ?: string | null,
    public senderId ?: string | null,
    public dateCreated ?: string | any| null,
    public dateAu ?: string | any| null,
  ) {
  }
}

export class ChatMessageObj{
  constructor(
    public productId ?: string,
    public senderId ?: string,
    public recieverId ?: string,
    public message ?: string,
  ){}
}

export class ChatSidebar {
  constructor(
    public product ?: Product,
    public action ?: string,
    public showPurchase ?: boolean,
  ){}
}
export class DataToCropperDialog {
  constructor(
    public event: any = null,
    public blobname: string = null,
    public file_type: string = null,
    public aspect_ratio: number = 5 / 7,
    public main_tain_aspect_ratio: boolean = true,
    public resize_to_width: number = 1200,
    public resize_to_height: number = 0,
    public need_resize: boolean = false,
    public round_cropper: boolean = false
  ) { }
}

export class DialogAfterCloseData {
  constructor(
      public result: boolean = false,
      public data: any = null
  ){}
}

export class ImageCropperDialogCloseData {
  constructor(
    public image_url: string = null,
    public resized_image_url: string = null
  ){}
}
export class MediaBlobImageObject {
  constructor(
    public documentname: string = null,
    public docurl: string = null,
    public resizedname: string = null,
    public resizedurl: string = null
  ){}
}
export class MediaBlobImage {
  constructor(
    public name?: string,
    public bytedata?: string,
    public needresize?: boolean,
    public blobname?: string,
    public documentblob?: string,
    public documenturl?: string,
    public type?: string,
    public resizewidth?: number,
    public resizeheight?: number
  ) { }
}
export class AfterDialogCloseData<T> {
  constructor(
      public result: boolean = false,
      public data: T = null
  ){}
}

export class ProductUpdateStatus {
  constructor(
    public status?: string,
    public productId?: string,
  ) { }
}
