import * as BackgroundTask from "expo-background-task"
import * as TaskManager from "expo-task-manager"
import { useEffect, useState } from "react"
import { StyleSheet, Text, View, Button } from "react-native"

const BACKGROUND_TASK_IDENTIFIER = "background-task"

// Register and create the task so that it is available also when the background task screen
// (a React component defined later in this example) is not visible.
// Note: This needs to be called in the global scope, not in a React component.
TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
  try {
    const now = Date.now()
    console.log(
      `Got background task call at date: ${new Date(now).toISOString()}`
    )
  } catch (error) {
    console.error("Failed to execute the background task:", error)
    return BackgroundTask.BackgroundTaskResult.Failed
  }
  return BackgroundTask.BackgroundTaskResult.Success
})

// 2. Register the task at some point in your app by providing the same name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function registerBackgroundTaskAsync() {
  return BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER)
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background task calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function unregisterBackgroundTaskAsync() {
  return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER)
}

export default function BackgroundTaskScreen() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    updateAsync()
  }, [])

  const updateAsync = async () => {
    const status = await BackgroundTask.getStatusAsync()
    setStatus(status)
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_TASK_IDENTIFIER
    )
    setIsRegistered(isRegistered)
  }

  const toggle = async () => {
    if (!isRegistered) {
      await registerBackgroundTaskAsync()
    } else {
      await unregisterBackgroundTaskAsync()
    }
    await updateAsync()
  }

  return (
    <View style={styles.screen}>
      <View style={styles.textContainer}>
        <Text>
          Background Task Service Availability:{" "}
          <Text style={styles.boldText}>
            {status ? BackgroundTask.BackgroundTaskStatus[status] : null}
          </Text>
        </Text>
      </View>
      <Button
        disabled={status === BackgroundTask.BackgroundTaskStatus.Restricted}
        title={
          isRegistered ? "Cancel Background Task" : "Schedule Background Task"
        }
        onPress={toggle}
      />
      <Button title="Check Background Task Status" onPress={updateAsync} />
      <Button title="test" onPress={async () => {
        await BackgroundTask.triggerTaskWorkerForTestingAsync()
        console.log('triggerTaskWorkerForTestingAsync')
      }} />
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  textContainer: {
    margin: 10
  },
  boldText: {
    fontWeight: "bold"
  }
})
