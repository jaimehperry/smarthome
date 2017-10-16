'use strict';
// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import * as request from 'request';

var switchList = [];
var config = vscode.workspace.getConfiguration('smarthome');
var oathEndpoint = 'https://graph.api.smartthings.com/oauth/authorize';

//  To activate the extension you need to install the Groovy Rest API to Smartthings 
//  and update apiEndpoint to your Rest API 
//  on https://graph.api.smartthings.com/
//  and supply a valid apiToken
var apiEndpoint = '****';
var apiToken = '****';

class Smarthome
{
    public getSwitches(type) {
        let options = {
            url: apiEndpoint + '/' + type,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': apiToken
            }
        }
        request(options, function (error, response, body) {
             if (!error && response.statusCode == 200) {
                switchList = [];
                let switchAry = JSON.parse(body);
                 
                 for(let i = 0; i < switchAry.length; i++) 
                 {
                
                     let sw = switchAry[i];
                     console.log("loop " + sw.name);
                     switchList.push(sw.name);
                 }

                 switchList.sort();

                 var smarthome = new Smarthome;
                 var pick = smarthome.quickPick();

                 pick.then(item => {
                     if(item && type == 'all') {
                        console.log("toggle switch - " + item)
                        smarthome.toggleSwitch(item);
                     }
                     else if(item && type == 'dim') {
                         console.log("Enter level");
                         smarthome.setLevel(item);
                     }
                 })
             }
             else if(!error){
                 console.log(response.statusCode + ' ' + body);
             }
             else {
                 console.log(error);
             }
        })
    }

    private quickPick() {
       return vscode.window.showQuickPick(switchList, { matchOnDescription: true, placeHolder: 'Select Device' });
    }

    private setLevel(switchName) {
        let level = '';
        vscode.window.showInputBox({prompt:'Enter brightness level'})
            .then(val => {
                if(!val) return;
                level = val;
                console.log('level ' + level);
                console.log(switchName + ' - ' + level);
                let options = {
                    url: apiEndpoint + '/setLevel/' + switchName + '/' + level,
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        'Authorization': apiToken
                    }
                };

                request(options, function (error, response, body) 
                {
                    if (!error && response.statusCode == 200) 
                    {
                        console.log("Success: " + body);
                    }
                }            
            });
    }

    private toggleSwitch(switchName) {
        let options = {
            url: apiEndpoint + '/toggle/' + switchName,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Authorization': apiToken
            }
        };

        request(options, function (error, response, body) 
        {
             if (!error && response.statusCode == 200) 
             {
                console.log("Success: " + body);
             }
        }
    }

    dispose() {
    }

}



// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "smarthome" is now active!');

    let smarthome = new Smarthome();
    vscode.commands.registerCommand('smarthome.all', () => smarthome.getSwitches('all'))
    vscode.commands.registerCommand('smarthome.dimmable', () => smarthome.getSwitches('dim'))
    context.subscriptions.push(smarthome);
}

// this method is called when your extension is deactivated
export function deactivate() {
}