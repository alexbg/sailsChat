var language = {};

$(window).ready(function(){
    webrtc : 'undefined',
    
    language.showProfile = function(){
        $('.show_profile').off('click').on('click','a',function(event){
            var id = $(this).attr('id');
            //alert(id);
            socket.post('/chat/showProfile',{id: id},function(message){
                //console.log(message);
                $('#m-username').html(message.username);
                $('#m-button').off('click').on('click',function(event){
                   socket.post('/chat/invite',{id: message.id},function(){
                       // avisaria de que se ha enviado la peticion
                       // por ahora solo cierra el modal
                       $('#myModal').foundation('reveal', 'close');
                   });
                   //alert('funciona');
                });
                $('#myModal').foundation('reveal', 'open');
            });
        });
    }
    
    language.message = function(element,message,type){
        element.html(message).hide();
        switch(type){
            case 'dange':
                element.attr('class','alert alert-danger ajax affix');
                break;
            case 'success':
                element.attr('class','alert-box success text-center');
                break;
            case 'warning':
                element.attr('class','alert-box warning text-center');
                break;
            case 'info':
                element.attr('class','alert-box info text-center');
                break;
        };
        element.show(500).delay(3000).hide(500);
    }
    
    language.upload = function(id){
        $('#u-'+id).fileupload({
            dataType: 'json',
            url:'/chat/upload',
            autoUpload : true,
            done: function (e, data) {
                alert('terminado');
            },
            fileuploadfail: function(e, data){
                alert('ha fallado');
            },
            fileuploadstart: function(e, data){
                alert('empieza a subir');
            },
            progressall: function (e, data) {
                alert('progresando');
            }
        });
        
    }
    
    
    //ejecucion funciones
    language.showProfile();
});


