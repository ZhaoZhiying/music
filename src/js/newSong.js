{
   let view = {
       el: '.page__sidebar__new',
       template: `
        新建歌曲
       `,
       render(data){
           $(this.el).html(this.template)
       }
   }
   let model = {}
   let controller = {
       init(view, model){
           this.view = view
           this.model = model
           this.view.render(this.model.data)
           this.active()
           window.eventHub.on('upload', (data)=>{
                this.active()
           })
           window.eventHub.on('select', (data)=>{
               this.deactive()
           })
           //监听点击事件
           $(this.view.el).on('click', this.active.bind(this))
       },
       active(){
           $(this.view.el).addClass('active')
           //说明用户要新建歌曲
           window.eventHub.emit('new') 
       },
       deactive(){
            $(this.view.el).removeClass('active')
       },
   }
   controller.init(view, model)
}