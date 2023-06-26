# nodeJS를 사용한 CRUD 구현
nodeJS 개인 프로젝트

**1. 개발 목표** : CRUD를 사용한 페이지 구현

**2. 메인 사진**
![main2](https://github.com/rony-yang/nodejs_CRUD_public/assets/116271236/0e9e1e73-77a1-40c4-ba46-bb6fbcd4eaac)

![11](https://github.com/rony-yang/nodejs_CRUD_public/assets/116271236/786cce32-9f99-416d-b2c0-de85936445fd)

**3. URL 주소** : https://nodejs-crud-qlcpt.run.goorm.site/ 

**4. 작업기간** : 2023. 6

**5. 사용 기술**

- 언어 : HTML, CSS(bootstrap), JavaScript(nodeJS), ajax

- 프로그램 : groomIDE

- DB : mysql

**6. 주요기능**

- 회원가입 기능 : 각 항목마다 알맞은 유효성검사 기능

- 로그인 및 로그아웃 : 로그인 시 상단 네비바에 로그인 중인 아이디를 표시하는 기능, 로그아웃으로 세션 삭제 기능

- 매출현황표 : DB정보를 날짜별로 정렬하여 가져오고, 각 월별 및 전체 합계 기능

- 거래처정보 : dataTable 기능을 사용하여 거래처 정보 출력 및 신규등록, 수정, 삭제 기능

**7. Advanced Feature**

회원가입 시 여러 항목에 같이 사용하는 공통함수를 생성하고 이를 활용하여 

사용하기 쉽고, 재사용성이 높은 코드로 구성하고자 하였습니다.

```javascript
// 유효성검사 메세지 출력 : red_text 와 blue_text 클래스를 생성하여 활용
function view_txt_message(elementId, message, color) {
	let element = document.getElementById(elementId);
		      element.innerText = message;

	if (color === "red") {
		element.classList.remove("blue_text");	
		element.classList.add("red_text");
	} else if (color === "blue") {
		element.classList.remove("red_text");
		element.classList.add("blue_text");
	}
}

// 실제 사용 예시
view_txt_message("userID_result", "사용할 수 있는 아이디입니다.", "blue");

  
// 공백여부 검사해서 에러메세지 출력하고 포커스 이동하기
function blank_check(fieldId, message) {
	view_txt_message("register_result", message, "red");
	$(fieldId).focus();
}

// 실제 사용 예시
blank_check("#userID", "아이디가 입력되지 않았습니다.");
  ```

