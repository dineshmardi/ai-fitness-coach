import { resetSmooth } from "../utils/smoothing";
import { analyzeSquat, resetSquat } from "./squatEngine";
import { analyzePushup, resetPushup } from "./pushupEngine";
import { analyzePlank, resetPlank } from "./plankEngine";
import { analyzeCrunch, resetCrunch } from "./crunchEngine";
import { analyzeLunge, resetLunge } from "./lungeEngine";
import { analyzeLegRaise, resetLegRaise } from "./legRaiseEngine";
import { analyzePikePushup, resetPikePushup } from "./pikePushupEngine";
import { analyzeGluteBridge, resetGluteBridge } from "./gluteBridgeEngine";
import { analyzeSidePlank, resetSidePlank } from "./sidePlankEngine";
import { analyzeChildPose, resetChildPose } from "./childPoseEngine";
import { analyzeTouchToes, resetTouchToes } from "./touchToesEngine";
import { analyzeHeadstand, resetHeadstand } from "./headstandEngine";
import { analyzeReverseTabletop, resetReverseTabletop } from "./reverseTabletopEngine";
import { analyzeSideLunge, resetSideLunge } from "./sideLungeEngine";
import { analyzeMountainClimber, resetMountainClimber } from "./mountainClimberEngine";
import { analyzeSingleLegBalance, resetSingleLegBalance } from "./singleLegBalanceEngine";
import { analyzeFlutterKicks, resetFlutterKicks } from "./flutterKicksEngine";
import { analyzeVUp, resetVUp } from "./vUpEngine";
import { analyzeStandingToeTouch, resetStandingToeTouch } from "./standingToeTouchEngine";
import { analyzeSeatedToeTouch, resetSeatedToeTouch } from "./seatedToeTouchEngine";
import { analyzeDiamondPushup, resetDiamondPushup } from "./diamondPushupEngine";

let currentExercise = "squat";

export function setExercise(name) {

    currentExercise = name;

    resetSmooth(); // 🔥 smooth movement

    // reset correct engine
    if (name === "squat") resetSquat();
    if (name === "pushup") resetPushup();
    if (name === "plank") resetPlank();
    if (name === "crunch") resetCrunch();
    if (name === "lunge") resetLunge();
    if (name === "legraise") resetLegRaise();
    if (name === "pikepushup") resetPikePushup();
    if (name === "glutebridge") resetGluteBridge();
    if (name === "sideplank") resetSidePlank();
    if (name === "childpose") resetChildPose();
    if (name === "touchtoes") resetTouchToes();
    if (name === "headstand") resetHeadstand();
    if (name === "reverseTabletop") resetReverseTabletop();
    if (name === "sidelunge") resetSideLunge();
    if (name === "mountainclimber") resetMountainClimber();
    if (name === "singlelegbalance") resetSingleLegBalance();
    if (name === "flutterkicks") resetFlutterKicks();
    if (name === "vup") resetVUp();
    if (name === "standingtoetouch") resetStandingToeTouch();
    if (name === "seatedtoetouch") resetSeatedToeTouch();
    if (name === "diamondpushup") resetDiamondPushup();

}

export function analyzeExercise(landmarks) {

    if (currentExercise === "squat") {
        return analyzeSquat(landmarks);
    }

    if (currentExercise === "pushup") {
        return analyzePushup(landmarks);
    }

    if (currentExercise === "plank") {
        return analyzePlank(landmarks);
    }
    if (currentExercise === "crunch") {
        return analyzeCrunch(landmarks);
    }
    if (currentExercise === "lunge") {
        return analyzeLunge(landmarks);
    }
    if (currentExercise === "legraise") {
        return analyzeLegRaise(landmarks);
    }
    if (currentExercise === "pikepushup") {
        return analyzePikePushup(landmarks);
    }
    if (currentExercise === "glutebridge") {
        return analyzeGluteBridge(landmarks);
    }
    if (currentExercise === "sideplank") {
        return analyzeSidePlank(landmarks);
    }
    if (currentExercise === "childpose") {
        return analyzeChildPose(landmarks);
    }
    if (currentExercise === "touchtoes") {
        return analyzeTouchToes(landmarks);
    }
    if (currentExercise === "headstand") {
        return analyzeHeadstand(landmarks);
    }
    if (currentExercise === "reverseTabletop") {
        return analyzeReverseTabletop(landmarks);
    }
    if (currentExercise === "sidelunge") {
        return analyzeSideLunge(landmarks);
    }
    if (currentExercise === "mountainclimber") {
        return analyzeMountainClimber(landmarks);
    }
    if (currentExercise === "singlelegbalance") {
        return analyzeSingleLegBalance(landmarks);
    }
    if (currentExercise === "flutterkicks") {
        return analyzeFlutterKicks(landmarks);
    }
    if (currentExercise === "vup") {
        return analyzeVUp(landmarks);
    }
    if (currentExercise === "standingtoetouch") {
        return analyzeStandingToeTouch(landmarks);
    }
    if (currentExercise === "seatedtoetouch") {
        return analyzeSeatedToeTouch(landmarks);
    }
    if (currentExercise === "diamondpushup") {
        return analyzeDiamondPushup(landmarks);
    }


    return null;
}