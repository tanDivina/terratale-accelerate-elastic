export interface WildlifeImage {
  id: string;
  photo_image_url: string;
  photo_description: string;
  natural_description?: string;
  species_name: string;
  common_name: string;
  english_name?: string;
  location: string;
  conservation_status: string | null;
}
