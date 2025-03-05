export interface TourNode{
    selector:string;
    body:string;
    header:string;
    position:'top'|'left'|'right'|'bottom'
    padding?:number;
}