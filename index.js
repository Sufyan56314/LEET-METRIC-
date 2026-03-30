// Declare these outside so they are in global scope
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");

    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-card");

    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username is Empty");
            return false;
        }

        const regex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        try {
            searchButton.textContent = "Searching....";
            searchButton.disabled = true;

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql/';
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: `
                    query userSessionProgress($username: String!) {
                        allQuestionsCount {
                            difficulty
                            count
                        }
                        matchedUser(username: $username) {
                            submitStats {
                                acSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                                totalSubmissionNum {
                                    difficulty
                                    count
                                    submissions
                                }
                            }
                        }
                    }
                `,
                variables: {
                    username: `${username}`
                }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the User Details");
            }

            const parsedData = await response.json();
            console.log("Logging data:", parsedData);
            

            if (!parsedData || !parsedData.data || !parsedData.data.matchedUser) {
                statsContainer.innerHTML = `<p>No Data Found</p>`;
                return;
            }

            // You can process the data here

            displayUserData(parsedData);

        } catch (error) {
            console.error("Fetch error:", error);
            if (statsContainer) {
                statsContainer.innerHTML = `<p>No Data Found</p>`;
            }
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }


        function updateProgress(solved, total, label, circle) {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);

        // Get original label (Easy, Medium, Hard) from the label element itself
         const labelText = label.getAttribute("data-label") || label.textContent.trim().split(":")[0];

        label.textContent = `${labelText}: ${solved}/${total}`;
    }


    function displayUserData(parsedData){
        totalQues = parsedData.data.allQuestionsCount[0].count;
        totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedTotalEasyQues , totalEasyQues , easyLabel , easyProgressCircle );
        updateProgress(solvedTotalMediumQues , totalMediumQues , mediumLabel , mediumProgressCircle);
        updateProgress(solvedTotalHardQues , totalHardQues , hardLabel, hardProgressCircle );

        const cardData = [
            {
                lable: "Overall Submission" , value:parsedData.data.matchedUser.submitStats.totalSubmissionNum
                [0].submissions  
            },
            {
                lable: "Overall Easy Submission" , value:parsedData.data.matchedUser.submitStats.totalSubmissionNum
                [1].submissions  
            },
            {
                lable: "Overall Medium Submission" , value:parsedData.data.matchedUser.submitStats.totalSubmissionNum
                [2].submissions  
            },
            {
                lable: "Overall Hard Submission" , value:parsedData.data.matchedUser.submitStats.totalSubmissionNum
                [3].submissions  
            },
            

        ];

        console.log("Card Data:" ,  cardData );
        

        
    }

    



    searchButton.addEventListener('click', function () {
        const username = usernameInput.value;
        console.log("Logging Username", username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});
