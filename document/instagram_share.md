웹 환경에서 **iOS/Android**로 접속했다는 것을 감지하고, **인스타그램 스토리 공유** 기능을 구현하려면 다음 흐름으로 진행할 수 있습니다.

---

## 1) 모바일 환경 & OS 판별하기

일반적으로 **User-Agent** 문자열을 확인하는 방식으로 iOS 혹은 Android 인지 판별합니다.  
(이 방법은 100% 신뢰할 수 있는 건 아니지만, 대부분의 모바일 환경을 커버합니다.)

```js
function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}

function isIOS() {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isMobile() {
  return isAndroid() || isIOS();
}
```

위와 같이 함수를 만들어 두고,

- **isMobile()** 으로 모바일인지 체크
- 모바일이면 iOS/Android 중 어느 쪽인지를 추가로 구분하여 필요한 동작을 수행하도록 할 수 있습니다.

---

## 2) 인스타그램 스토리 딥링크(커스텀 스킴) 이해하기

인스타그램은 공식적으로 스토리에 콘텐츠를 공유할 수 있는 **커스텀 스킴**을 제한적으로 지원합니다.  
주요 형식은 다음과 같습니다.

```
instagram-stories://share
```

이 URI를 호출하면, **인스타그램 스토리 작성 화면**이 열리며, 여기에 배경 이미지나 스티커(스티커 이미지) 등을 넘길 수 있습니다.

> **주의**: 사용자의 기기(모바일)에 인스타그램 앱이 **설치되어 있어야** 열립니다. 설치되지 않은 경우 아무 반응이 없거나 에러가 발생할 수 있습니다.

### 2-1) 인스타그램 스토리로 이미지 전달하기

- iOS/Android에서 인스타그램 앱이 설치되어 있으면 `instagram-stories://share` 호출 시 스토리 작성화면이 열립니다.
- 이때 **배경 이미지(Background image)**, **스티커 이미지(Sticker image)**, **색상(Color)** 등을 파라미터로 함께 넘길 수 있습니다.

#### 예시 파라미터

1. **Background Image**
   - base64로 인코딩된 PNG/JPEG 이미지를 `backgroundImage` 파라미터로 전달
   - MIME 타입: `image/png` 또는 `image/jpeg`
2. **Sticker Image**
   - base64로 인코딩된 PNG를 `stickerImage` 파라미터로 전달(투명 배경 가능)
3. **Top/Bottom 색상**
   - HEX 색상 코드(`%23ffffff` 등)로 URL-Encoded 형태로 전달

실제 스키마 예시:

```
instagram-stories://share?source_application=<당신의 앱 ID>
&backgroundImage=<base64 인코딩된 이미지>
&topBackgroundColor=%23fefefe
&bottomBackgroundColor=%23fefefe
```

> **주의**: 이 딥링크 포맷은 공식 문서에서 자주 바뀔 수 있으므로, [Meta for Developers(Instagram Graph API 등)](https://developers.facebook.com/docs/instagram/sharing-to-stories/) 문서를 참고해야 합니다.

---

## 3) 구현 예시 (JavaScript)

아래는 간단한 예시로, **버튼 클릭 시** 인스타그램 스토리로 공유를 시도하는 코드입니다.  
(웹 환경에서 React가 아닌 순수 JS로 예시를 들겠습니다.)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Instagram Story Share</title>
  </head>
  <body>
    <button id="share-instagram">인스타그램 스토리 공유하기</button>

    <script>
      // (1) 모바일 OS 판별 함수
      function isAndroid() {
        return /Android/i.test(navigator.userAgent);
      }

      function isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
      }

      function isMobile() {
        return isAndroid() || isIOS();
      }

      // (2) base64로 인코딩된 이미지(예시)
      // 실제로는 서버나 Canvas 등에서 이미지를 Base64로 변환해 사용
      const base64Image = "data:image/png;base64,...(생략)...";

      // (3) 인스타그램 스토리 공유 함수
      function shareToInstagramStory() {
        if (!isMobile()) {
          alert("모바일 기기에서만 공유가 가능합니다.");
          return;
        }

        // 인스타그램 스토리 딥링크
        const scheme = "instagram-stories://share";
        const appId = "your_app_id"; // (선택) Meta 개발자 계정에 등록한 앱 ID

        // 인코딩된 파라미터 준비
        const backgroundImage = encodeURIComponent(base64Image);
        const topColor = "%23ffffff"; // #ffffff -> %23ffffff
        const bottomColor = "%23ffffff";

        // 최종 URL 생성
        const url = `${scheme}?source_application=${appId}&backgroundImage=${backgroundImage}&topBackgroundColor=${topColor}&bottomBackgroundColor=${bottomColor}`;

        // (4) 인스타그램 앱으로 연결 시도
        window.location.href = url;

        // (5) 인스타그램 미설치 시 후속처리
        // 위 location.href 호출 후 일정 시간 내에 앱이 열리지 않으면,
        // 앱 미설치로 판단 후 안내 팝업을 띄우는 방식을 사용할 수도 있음.
        // setTimeout(() => {
        //   alert("인스타그램 앱이 설치되어 있지 않습니다.");
        // }, 2000);
      }

      // (6) 버튼 클릭 이벤트 바인딩
      document
        .getElementById("share-instagram")
        .addEventListener("click", shareToInstagramStory);
    </script>
  </body>
</html>
```

### 동작 흐름

1. **"인스타그램 스토리 공유하기"** 버튼을 누르면 `shareToInstagramStory()` 함수가 실행됩니다.
2. 해당 함수에서 모바일 기기가 아니라면(`isMobile()` 체크), “모바일 기기에서만 가능” 안내를 띄웁니다.
3. 모바일 기기라면, `instagram-stories://share?...` 형태의 URL로 `window.location.href`를 설정해 **인스타그램 앱** 실행을 시도합니다.
4. 정상적으로 인스타그램 앱이 깔려 있고, 딥링크가 지원되면 인스타그램 스토리 작성 화면으로 넘어가고, 우리가 전달한 배경 이미지가 반영된 상태로 열리게 됩니다.
5. 만약 인스타그램 앱이 설치되어 있지 않다면, 아무 반응이 없거나 에러가 발생하므로 추가적인 안내(UI/알림창)를 노출시킬 수 있습니다.

---

## 4) 주의 및 팁

1. **PC 환경 대응**:

   - PC 브라우저에서는 `instagram-stories://` 스킴이 동작하지 않으므로, 공유 버튼을 감추거나 “모바일에서만 이용 가능” 안내를 해주어야 합니다.

2. **인스타그램 앱 설치 여부**

   - 위와 같이 단순히 `window.location.href`로 커스텀 스킴을 호출하면, 앱이 설치되어 있지 않은 경우 반응이 없을 수 있습니다.
   - 이때, 일정 시간(`setTimeout`) 후 앱이 열리지 않으면 설치 안내 페이지(앱스토어 링크)를 띄우는 등 “미설치 대비 처리”를 해줄 수 있습니다.

3. **React/Next.js 환경**

   - 로직 자체는 동일합니다. 다만, 이벤트 핸들러나 링크 처리 부분을 React 컴포넌트 형태로 작성하면 됩니다.
   - 예: `onClick`에 `shareToInstagramStory` 함수를 바인딩해서 사용.

4. **실제 이미지 전달**

   - 예시 코드에서는 `base64` 문자열을 간단히 기입했지만, 실제로는
     - **Canvas**에서 `toDataURL()`을 통해 만든다거나
     - **서버에서 이미지 파일을 Base64로 변환**하여 가져오는 식으로 구현합니다.
   - **스티커 이미지**를 추가하고 싶다면 `stickerImage=<base64>` 파라미터를 추가해 전달할 수 있습니다.

5. **공식 문서 확인**
   - 인스타그램은 종종 딥링크, Story Share API 정책을 수정합니다.
   - 최신 정보는 [Meta for Developers](https://developers.facebook.com/docs/instagram/sharing-to-stories/) 문서를 참고하세요.

---

## 5) 결론

- **모바일 환경(iOS/Android)인지 판별** 후,
- **인스타그램 스토리 딥링크**를 구성하여 `window.location.href`로 호출함으로써,
- **스토리 작성 화면**에 직접 연결할 수 있습니다.

이 방식은 웹 페이지에서 **카카오톡 공유하기**처럼 완전히 동일한 UX(자동 미리보기, 메시지 텍스트 등)를 만들기는 어렵지만, **“바로 인스타그램 스토리로 넘어가서 이미지 업로드”** 정도의 흐름은 구현 가능합니다.  
다만, **피드 업로드**나 **설치되지 않은 환경** 대응에는 별도 예외 처리가 필요함을 유의하시면 됩니다.
