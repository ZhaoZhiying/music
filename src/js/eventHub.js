window.eventHub = {
    events: {},
    emit(eventName, data){
        for(let key in this.events){
            if(key === eventName){
                let keyList = this.events[key]
                keyList.map((key)=>{
                    key.call(undefined, data)
                })
            }
        }
    },
    on(eventName, key){
        if(this.events[eventName] === undefined){
            this.events[eventName] = []
        }
        this.events[eventName].push(key)
    },
}