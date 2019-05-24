export interface Recipe {
    author: string;
    avgRating: number;
    title: string;
    userId: string;
    image: string;
    likes: string;
    published: any;
    time: FunctionStringCallback;
    description: string;
    ingredients: Array<any>;
    steps: Array<string>;
    category: string;
    ingredientsNames: Array<string>;
 }

 export interface RecipePreview {
    author: string;
    avgRating: number;
    title: string;
    userId: string;
    image: string;
    published: string;
    category: string;
 }
