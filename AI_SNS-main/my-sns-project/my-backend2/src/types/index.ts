export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export interface SignRecognitionResponse {
  signName: string;
  confidence: number; // 0.0 ~ 1.0
  timestamp: string;
}