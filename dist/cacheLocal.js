/*
 * cacheLocal.js
 * v1.0 - 2017-10-13
 * https://github.com/wdchui/cacheLocal
 */
(function(){
    window.cacheJsLocal = {
        resourceChain:[],
        checkSupport:function(){
            try{
                return window.localStorage && window.JSON || false;
            }catch(e){
                return false
            }
        },
        setItem:function(item){
            try{
                localStorage.setItem(item.key, JSON.stringify(item))
            }catch(e){
                return false;
            }
        },
        getItem:function(itemKey){
            var item = localStorage.getItem(itemKey);
            try{
                return JSON.parse(item || 'false');
            }catch(e){
                return false;
            }
        },
        removeItem:function(itemKey){
            localStorage.removeItem(itemKey);
        },
        getUrl:function(obj, callback){
            try{
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if ( xhr.readyState === 4 && (( xhr.status === 200 ) || (( xhr.status === 0 ) && xhr.responseText ))) {
                        var item = {
                            key:obj.key,
                            value:xhr.responseText,
                            version:obj.version
                        }
                        callback(item);
                        cacheJsLocal.evalJs(xhr.responseText);
                        var nextRes = cacheJsLocal.resourceChain.shift();
                        nextRes && cacheJsLocal.loadRes(nextRes);
                    }
                };
                xhr.open( 'GET', obj.url+'?v='+obj.version, false);
                xhr.send();
            }catch(e){

            }
        },
        isNew:function(itemKey, version){
            var item = cacheJsLocal.getItem(itemKey);
            if(item){
                return item.version == version
            }else{
                return false;
            }
        },
        loadRes:function(obj){
            if(cacheJsLocal.isNew(obj.key, obj.version)){
                var item = cacheJsLocal.getItem(obj.key);
                cacheJsLocal.evalJs(item.value);
                var nextRes = cacheJsLocal.resourceChain.shift();
                nextRes && cacheJsLocal.loadRes(nextRes);
            }else{
                cacheJsLocal.removeItem(obj.key);
                cacheJsLocal.getUrl(obj,cacheJsLocal.setItem);
            }
        },
        evalJs:function(text){
            var head = document.head || document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.defer = true;
            script.text = text;
            head.appendChild(script);
        }
    }
})();