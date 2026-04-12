using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

public class NetworkManager : MonoBehaviour
{
    public void CallGetRequest(string uri)
    {
        // IEnumerator 함수는 StartCoroutine으로 실행해야 합니다.
        StartCoroutine(GetRequest(uri));
    }

    public void CallPostRequest()
    {
        // 1. 데이터 객체 생성
        LoginRequest myData = new LoginRequest
        {
            userID = "test1234",
            password = "qwer1234"
        };

        // 2. JSON으로 변환
        string json = JsonUtility.ToJson(myData);

        // 3. 코루틴 실행 (URL은 컨트롤러의 라우팅 규칙에 따라 api/Home/test)
        StartCoroutine(PostRequest("https://localhost:7155/api/Auth/login", json));
    }

    IEnumerator GetRequest(string uri)
    {
        using (UnityWebRequest webRequest = UnityWebRequest.Get(uri))
        {
            webRequest.timeout = 5;

            yield return webRequest.SendWebRequest();

            if (webRequest.result == UnityWebRequest.Result.Success)
                Debug.Log("Received: " + webRequest.downloadHandler.text);
            else if (webRequest.result == UnityWebRequest.Result.ConnectionError ||
                             webRequest.result == UnityWebRequest.Result.ProtocolError)
            {
                Debug.LogError("Error: " + webRequest.error);
            }
        }
    }

    IEnumerator PostRequest(string url, string json)
    {
        using (UnityWebRequest webRequest = UnityWebRequest.Post(url, json, "application/json"))
        {
            // 타임아웃 추가
            webRequest.timeout = 5;

            yield return webRequest.SendWebRequest();

            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("Post 성공: " + webRequest.downloadHandler.text);
            }
            else
            {
                Debug.LogError("Post 실패: " + webRequest.error);
            }
        }
    }
}

[System.Serializable]
public class LoginRequest
{
    public string userID;
    public string password;
}