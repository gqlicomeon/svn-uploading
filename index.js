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
    let obj = {modifyList:[],addList:[],unknownList:[],deleteList:[]}
    arr.slice(0,-1).forEach(val => {
        let [type,url] = val.split(/\s+/);
        url = resolve(cwd,url);
        switch(type){
            case "?":
                obj.unknownList.push(url);
                break; 
            case "A":
                obj.addList.push(url);
                break;
            case "M":
                obj.modifyList.push(url);
                break;
            case "D":
                obj.deleteList.push(url);
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
        this.status = null;
    }
    //svn update更新代码
    update(){
        let that = this;
        return new Promise((resolve,reject)=>{
            exec("svn update",{cwd:that.cwd},(error,stdout,stderr)=>{
                if (error) {
                    reject(new Error(error));
                }
                if(stdout){
                    resolve(true);
                }
                if(stderr){
                    reject(new Error(stderr));
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
                    reject(new Error(error));
                }
                if(stdout){
                    that.status = handleStatus(stdout,that.cwd);
                    resolve(that.status);
                }
                if(stderr){
                    reject(new Error(stderr));
                }
            })
        })
    }
    async add(addPath){//添加单个文件或者文件夹到svn
        let that = this;
        if(!that.status){
            throw new Error("请先调用check方法获取当前检出目录的状态");
        }
        let {addList,unknownList,modifyList} = this.status;
        if(addPath){
            addPath = resolve(that.cwd,addPath);
            if(unknownList.includes(addPath)){//所添加文件在add目录
                return await new Promise((resolve,reject)=>{
                    exec(`svn add ${addPath}`,{cwd:that.cwd},(error,stdout,stderr)=>{
                        if (error) {
                            reject(new Error(error));
                        }
                        if(stdout){
                            resolve(stdout);
                        }
                        if(stderr){
                            reject(new Error(stderr));
                        }
                    })
                })
            }else if(addList.includes(addPath) || modifyList.includes(addPath)){//所添加文件在modify目录
                throw new Error(`${addPath}已被添加到svn,不需要重复添加`);
            }else{
                throw new Error(`add ${addPath}失败,无法找到该文件`);
            }
        }else{//为空则添加this.cwd下所有的文件到svn
            for(let i=0;i<addList.length;i++){
               return await this.add(addList[i]);
            }
        }
    }
    delete(deletePath){
        let that = this;
        return new Promise((resolve,reject)=>{
            if(!that.status){
                reject(new Error("请先调用check方法获取当前检出目录的状态"));
            }
            if(deletePath){
                deletePath = resolve(that.cwd,deletePath);
                exec(`svn delete ${deletePath}`,{cwd:that.cwd},(error,stdout,stderr)=>{
                    if (error) {
                        reject(new Error(error));
                    }
                    if(stdout){
                        resolve(stdout);
                    }
                    if(stderr){
                        reject(new Error(stderr));
                    }
                })
            }else{
                reject(new Error("delete方法缺少参数，无法删除"));
            }
        })
    }
    /**
     * @param {Object}
     * @description {name} 上传单个文件时name为文件或文件名的相对路径或绝对路径；若上传cwd路径下的所有文件，name传空
     * @description {msg} 本次上传说明
     */
    commit({name,msg="提交更改代码"}={}){
        let that = this;
        return new Promise((resolve,reject)=>{
            let execStr = name ? `svn commit -m ${msg} ${resolve(this.cwd,name)}` : `svn commit -m ${msg}`;
            exec(execStr,{cwd:that.cwd},(error,stdout,stderr)=>{
                if (error) {
                    reject(new Error(error));
                }
                if(stdout){
                    resolve(stdout);
                }
                if(stderr){
                    reject(new Error(stderr));
                }
            })
        })
    }
    /**
     * 
     * @param {Object} opts {name,msg}
     */
    async upload(opts){
        await this.update();//更新
        await this.check();//检出
        await this.add(opts.name);
        return await this.commit(opts);
    }
}

module.exports = SvnUploading;