import cv2
import numpy as np
import os

# --- 【究極の修正】mp.solutions を一切使わない書き方 ---
from mediapipe.python.solutions import hands as mp_hands
from mediapipe.python.solutions import drawing_utils as mp_draw

# TensorFlowの通知をオフ
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# 設定
DATA_PATH = os.path.join('MP_Data')
actions = np.array(['hello', 'thanks', 'help'])
no_sequences = 30
sequence_length = 30

# --- 【究極の修正】mp.solutions.hands ではなく mp_hands を直接使う ---
hands_detector = mp_hands.Hands(
    static_image_mode=False, 
    max_num_hands=2, 
    min_detection_confidence=0.5, 
    min_tracking_confidence=0.5
)

# フォルダ作成
for action in actions:
    for sequence in range(no_sequences):
        os.makedirs(os.path.join(DATA_PATH, action, str(sequence)), exist_ok=True)

def extract_keypoints(results):
    if results.multi_hand_landmarks:
        res = np.array([[res.x, res.y, res.z] for res in results.multi_hand_landmarks[0].landmark]).flatten()
    else:
        res = np.zeros(21*3)
    return res

cap = cv2.VideoCapture(0)

print("カメラを起動中... 画面が開くまでお待ちください。")

# 収集ループ
for action in actions:
    for sequence in range(no_sequences):
        for frame_num in range(sequence_length):
            ret, frame = cap.read()
            if not ret: continue

            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands_detector.process(image) # ここも修正済み
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            cv2.putText(image, f'Collecting: {action} Video:{sequence}', (15,30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
            
            if frame_num == 0:
                cv2.putText(image, 'STARTING COLLECTION', (120,200), 
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 4, cv2.LINE_AA)
                cv2.imshow('OpenCV Feed', image)
                cv2.waitKey(2000)
            else:
                cv2.imshow('OpenCV Feed', image)

            keypoints = extract_keypoints(results)
            npy_path = os.path.join(DATA_PATH, action, str(sequence), str(frame_num))
            np.save(npy_path, keypoints)

            if cv2.waitKey(10) & 0xFF == ord('q'):
                break

cap.release()
cv2.destroyAllWindows()