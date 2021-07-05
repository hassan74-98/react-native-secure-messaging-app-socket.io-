import BackgroundService from 'react-native-background-actions';
import BackgroundJob from 'react-native-background-actions';

const sleep = (time) => {
    return(new Promise(resolve => setTimeout(() => resolve(), time)))
};
class BService{
    constructor(){
        this.Options = {
            // taskName: '',
            // taskTitle: 'SMSGR',
            // taskDesc: 'keep socket alive',
            // taskIcon: {
            //     name: 'ic_launcher',
            //     type: 'mipmap',
            // },
            // color: '#ff00ff',
            parameters: {
                delay: 1000,
            },
            // actions: '["Exit"]'
        };   
    }
    async VeryIntensiveTask(taskDataArguments){
        
        const { delay } = taskDataArguments;
        await new Promise(async (resolve) => {
            var i = 0;
            for (let i = 0; BackgroundJob.isRunning(); i++) {  
                console.log("background task")
                message: "Success DOOD "+i
                // })
                await sleep(delay);    
                }                     
        });
    }
    Start(){
        BackgroundService.start(this.VeryIntensiveTask, this.Options);
    }
    Stop(){
        BackgroundService.stop();
    }
}

const BackgroudService = new BService();
export default BackgroudService;