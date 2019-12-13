/*Svn 上传插件*/
const {exec} = require("child_process");
const {resolve} = require("path");
/**
 * 处理$ svn status的输出
 * @param {String} str 
 * @param {String} cwd 
 * @return {Object} 
 */
function handleStatus(str,cwd=process.cwd()){
    let arr = str.split(/\n|\r/);
    let obj = {modify:[],add:[]}
    arr.slice(0,-1).forEach(val => {
        let [type,url] = val.split(/\s+/);
        url = resolve(cwd,url);
        switch(type){
            case "M":
                obj.modify.push(url);
                break;
            case "?":
                obj.add.push(url);
                break; 
        }
    });
    return obj;
}

class SvnUploading{
    /**
     * @param {Object} cwd 要上传目录的checkout路径
     * @returns {Object} 返回svn实例 可以调用upload方法上传
     */
    constructor({cwd=process.cwd()}={}){
        this.cwd = cwd;//默认为node命令执行所处的文件夹,绝对路径
        this._status = {modify:[],add:[]};
    }
    //svn update更新代码
    update(){
        let that = this;
        return new Promise((resolve,reject)=>{
            exec("svn update",{cwd:that.cwd},(error,stdout,stderr)=>{
                if (error) {
                    console.error(error);
                    reject(false);
                }
                if(stdout){
                    resolve(true);
                }
                if(stderr){
                    console.error(stderr);
                    reject(false);
                }
            })
        })
    }
    //svn status 查看状态
    check(){
        let that = this;
        return new Promise((resolve,reject)=>{//查看svn文件状态
            exec("svn status",{cwd:that.cwd},(error,stdout,stderr)=>{
                if (error) {
                    console.error(error);
                    reject(error);
                }
                if(stdout){
                    that._status = handleStatus(stdout,that.cwd);
                    resolve(that._status);
                }
                if(stderr){
                    console.error(stderr);
                    reject(stderr);
                }
            })
        })
    }
    async add(addPath){//添加单个文件或者文件夹到svn
        let that = this;
        let addArr = this._status.add;
        let modifyArr = this._status.modify;
        if(addPath){
            addPath = resolve(that.cwd,addPath);
            if(addPath && addArr.includes(addPath)){//所添加文件在add目录
                return await new Promise((resolve,reject)=>{
                    exec(`svn add ${addPath}`,{cwd:that.cwd},(error,stdout,stderr)=>{
                        if (error) {
                            console.error(error);
                            reject(false);
                        }
                        if(stdout){
                            resolve(true);
                        }
                        if(stderr){
                            console.error(stderr);
                            reject(false);
                        }
                    })
                })
            }else if(modifyArr.includes(addPath)){//所添加文件在modify目录
                console.error(`${addPath}已被添加到svn,不需要重复添加`);
                return addPath;
            }else{
                console.error(`没有找到文件${addPath}`);
                return false;
            }
        }else{//为空则添加this.cwd下所有的文件到svn
            for(let i=0;i<addArr.length;i++){
                await this.add(addArr[i]);
                return true;
            }
        }
    }
    /**
     * @param {Object}
     * @description {name} 上传单个文件时name为文件或文件名的相对路径或绝对路径；若上传cwd路径下的所有文件，name传空
     * @description {msg} 本次上传说明
     */
    async upload({name,msg="提交更改代码"}={}){
        let that = this;
        let ifUpdate = await this.update();
        let ifCheck = ifUpdate && await this.check();
        if(!ifCheck){
            return false;
        }
        let {add,modify} = this._status;
        if(add.length === 0 && modify.length === 0){
            console.error(`${this.cwd}下的文件没有改动,不能提交svn`);
            return false;
        }
        //添加文件
        let addStatus = await this.add(name);
        if(addStatus){
            let execStr = name ? `svn commit -m ${msg} ${resolve(this.cwd,name)}` : `svn commit -m ${msg}`;
            return await new Promise((resolve,reject)=>{
                exec(execStr,{cwd:that.cwd},(error,stdout,stderr)=>{
                    if (error) {
                        console.error(error);
                        reject(false);
                    }
                    if(stdout){
                        console.log(stdout);
                        resolve(true);
                    }
                    if(stderr){
                        console.error(stderr);
                        reject(false);
                    }
                })
            })
        }
    }
}

module.exports = SvnUploading;