<?php
use OCP\Util;
$appId = OCA\ReportEnricher\AppInfo\Application::APP_ID;
Util::addScript($appId, $appId . '-mainScript');
Util::addStyle($appId, 'main');
?>

<div id="app-content">
<?php
if ($_['app_version']) {
    // you can get the values you injected as template parameters in the "$_" array
    echo '<h3>Report generation app version: ' . $_['app_version'] . '</h3>';
}
?>
    <div class="container">
        <form id="reportForm" enctype="multipart/form-data">
            <select id="reports" name="reports">
                <option value="client-health">Client Health Report</option>
                <option value="management-plan">Consolidated Management Plan</option>
                <option value="image-edit">Personalize Image</option>
            </select><br>
            <input id="file" type="file" /><br>
            <button type="submit">Upload</button>
        </form> 

        <div id="rightDiv">
            <button id="download-insights">Download Insights</button>
            <div id="response">
                <img id="image-element" src="">
            </div>
            <div id="loader" class="loader"></div>
        </div>
    </div>
</div>