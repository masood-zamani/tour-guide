export interface TourNode{
    selector:string;
    body:string;
    position:'top'|'left'|'right'|'bottom'
    padding?:number;
}

export interface IGuideData{
    id: string;
    body: string;
    header: string;
    position: 'top' | 'left' | 'right' | 'bottom';
}


export interface IGuideHandler extends HTMLDivElement{
    
    /** The ID read from the i-guide="id" attribute. */
    __dataId:string | null;

    /** The rectangle of the target element to show the handler on top of it. */
    __targetRect:DOMRect|null;

    /** Indicates if the mouse is on top of the handler (if the handler is hovered). */
    __isActive:boolean;

    /** The target HTML element that the handler is added on top of. */
    __target:HTMLElement|null;

    /**A reference to the timeout for removing the handler, which can be cleared as needed. */
    __removeTimeout:any;
}