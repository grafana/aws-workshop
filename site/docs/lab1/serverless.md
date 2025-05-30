---
sidebar_position: 3
---

# 1.3. The Serverless Detective 🕵️

You're monitoring a hybrid serverless application that includes both AWS Lambda functions and ECS Fargate containers. The application processes e-commerce orders through different microservices.

The problem is, this application is deployed using different AWS services, and across different regions. How do you begin to troubleshoot that?

Dust off your trenchcoat and grab your hat: we're going to see how you might troubleshoot a problem in your AWS serverless infrastructure with Grafana Cloud.

## Step 1: Respond to the alarm

Let's start by investigating an active SLO burn-down event, which seems to be affecting your serverless application.

:::info

A Service Level Objective (SLO) defines a specific, measurable target, which represents the quality-of-service that you provide to your users.

**Grafana SLO** makes it easy to create, manage, monitor, and alert on your Service Level Objectives, right inside Grafana, using almost any query or metric. 

[Find out more about Grafana SLO](https://grafana.com/docs/grafana-cloud/alerting-and-irm/slo/)

:::

1.  From the side menu, navigate to **Alerts & IRM > SLO** to show the Grafana SLO dashboard.

    This dashboard shows our services which currently have an SLO defined. There is 1 SLO configured.

1.  Click on the **mythical-server-success-rate** service to show the SLO dashboard.

1.  Oh no! It seems that the *server* service is experiencing issues.

    ![image](./img/slo_burn.png)

1.  Grafana SLO allows us to see a breakdown view with the worst-performing instances or groups of our service.

    For example, we might choose to break down our SLO by region, or by namespace, or by any other label that we have defined in our application's instrumentation.

    Scroll down to the graphs section. We can see that the Service Level Indicator (SLI) has dropped for all services.

    In particular, the Event Rate for the `POST /:endpoint` operation is showing much higher than usual. This seems like a good place to start investigating.

Notice that the error budget will be exhausted in **6 hours** at the current burn rate. So we need to fix this!



## Step 2: Get the big picture

Let's use Grafana Cloud Application Observability to drill down into the service performance issues, with telemetry collected and shipped with OpenTelemetry.

1.  Navigate to **Observability -> Application** to show the Service Inventory page.

    The service inventory is displayed. This allows you to see the health of all your OpenTelemetry-instrumented services, at a glance. Whether you're running services on Kubernetes, on ECS Fargate, or Lambda serverless functions, you can see the overall health of your services at a glance.

    ![image](./img/app_o11y.png)

1.  Let's get the big picture. Click on the **Service Map** to show the graph of interconnected services.

    Notice that _mythical-server_ seems to be experiencing an elevated error rate, as it is surrounded by a red circle.

    ![image](./img/app_o11y_servicemap.png)


1.  Click on the **mythical-server** circle, then from the pop-up menu, click **Service Overview** to show the service details. We can see that this service is experiencing some errors.

    This shows us an aggregate view over all instances of our service, across all regions or availability zones.

    ![image](./img/app_o11y_mythicalserver.png)

    Check out the Operations panel which shows us the operations invoked on this service. 

1.  Let's break down the service by availability zone. In the _Group by_ dropdown, select **cloud.region**. This will show us the error rate for each region.

    Now we see something fascinating. The error rate is much higher in one availability zone than another.

    We're starting to see something interesting here. The service is deployed in multiple zones, and one of them is experiencing issues. This is causing the overall service to be degraded, and the SLO to be violated.

1.  Look at the Errors graph: see how the error rate seems to be much more elevated in the `us-east-1` region.

**Question:** What could be causing the error rate to be higher in this region? Could it be a network issue, or a problem with the database connection, or something else?


## Step 3: Troubleshoot with OpenTelemetry

- Observe increase in trace error rate
- Can we correlate to RDS logs here?

Now that we can see where the error is happening, and who is affected, let's use the other solutions in Grafana Cloud to figure out what's going on.

1.  Let's navigate to Drilldown Traces, which gives us another way to view trace data.

    From the side menu, click on **Drilldown -> Traces**.

    Drilldown Traces gives us an incredibly powerful view for diving into our trace data, allowing us to see the flow of requests through our application, and how they are affected by different services.

    We can slice and dice the trace data in hundreds of different ways, making it easy to find the root cause of issues in our application.

1.  From the Drilldown Traces home page, click on **Errors rate** at the top to switch the view to showing traces with errors.

1.  In the Group By section, we can group traces by service, operation, or any other attribute that we have defined in our OpenTelemetry instrumentation.

    The default is **service.name**. But we can also group by **cloud.region** to see traces grouped by AWS region, or **aws.ecs.task.family** to see traces grouped by ECS Fargate task.

    Try grouping by **aws.ecs.task.family** to see traces grouped by ECS Fargate task.

1.  By **mythical-beasts-server**, click on Add to filters.

    This will filter the traces to only show those where the trace began in the mythical-beasts-server service.

    Now we're zooming in to the problem.


## Step 4: Digging into error traces

1.  Click on the **Errored traces** tab to show the list of errored traces.

1.  Click on one of the traces to see the details.

    Expand trace sections to see the full request flow:

       Requester -> request handler -> pg-query.INSERT postgres

    ![image](./img/drilldowntraces_error_trace.png)
    
1.  Notice how the span is indicated with an error icon, and the error message is shown in the span's **Status Message**.

    > Query read timeout  
    > Connection terminated unexpectedly  
    > Connection terminated due to connection timeout

    This is a clue that the problem might be with the database connection, which is causing the service to fail.

    Notice that OpenTelemetry also provides rich contextual data about this database interaction:

    - db.connection_string: `postgresql://mythical-beasts-database.cfcmk82ycrhh.us-east-1.rds.amazonaws.com:5432/postgres`
    - db.system: `postgres`
    - net.peer.name: `mythical-beasts-database.cfcmk82ycrhh.us-east-1.rds.amazonaws.com`

1.  Notice how many of the spans reach a limit of **30 seconds**. 

## Step 5: View managed service logs

Now we can see it's a database issue, let's check the health of the database itself.

1.  Navigate to **Drilldown -> Logs** to see the logs view.

1.  In the search box, search for `mythical-beasts-database`. This will show us all the logs related to our RDS database.

    We have configured Grafana Cloud to scrape RDS logs via CloudWatch, so we can see the logs right here in Grafana Drilldown Logs.

1.  Click on a log line to expand it. 

    Notice how the log line contains the same error message as the trace span: `Query read timeout`.

    This confirms that the issue is with the database connection, and that the service is failing because it cannot connect to the database.

## Step 5: Confirm the root cause with RDS logs and metrics

Using Cloud Provider O11y, we can see the health of our AWS managed services, like RDS database instances.

- Drilldown Logs to see RDS database logs (ingested into Grafana Cloud, so you can view them right here in Grafana)
- Navigate to CP O11y to check database health
- Uncover saturation issues in AWS managed services

1.  Navigate to Cloud Provider -> AWS. Then in the Dashboard list, select **AWS/RDS**.

    ![image](./img/cpo11y_rds_home.png)

1.  Notice how CP O11y is showing that our RDS instance is experiencing high CPU usage and connection errors.

1.  This is the root cause of the issue. The database is overloaded, causing the service to fail.

It looks like our database is undersized. We'll increase the sizing.


## Step 6: Remediation and monitoring

1.  Your facilitator will now fix the issue (using a special, patented Grafana magic wand - please don't ask about this special technology).

1.  Navigate back to **Application Observability** - watch error rates drop across both Lambda and ECS Fargate services.


## Wrapping Up

In this lab, you learned how to:

- Detect SLO violations and track error budget burn using Grafana SLO management

- Use Application Observability with OpenTelemetry resource attributes to isolate issues by AWS region and service type

- Analyze distributed traces spanning AWS Lambda functions and ECS Fargate containers

- Implement proactive monitoring and incident response workflows for serverless applications

Click **Next** to continue to the next module.
